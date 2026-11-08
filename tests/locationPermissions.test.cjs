const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const babel = require('@babel/core');

const sourcePath = path.join(__dirname, '..', 'src', 'components', 'service', 'location', 'tracking.js');
const source = fs.readFileSync(sourcePath, 'utf8');
const compiled = babel.transformSync(source, {
    babelrc: false,
    configFile: false,
    plugins: ['@babel/plugin-transform-modules-commonjs'],
}).code;

const createTracking = ({foreground, background, platform = 'android'}) => {
    const calls = [];
    const module = {exports: {}};
    const mocks = {
        '@react-native-async-storage/async-storage': {
            setItem: async () => calls.push('record-request'),
        },
        'react-native': {Platform: {OS: platform}},
        'expo-location': {
            requestForegroundPermissionsAsync: async () => {
                calls.push('foreground');
                return foreground;
            },
            getBackgroundPermissionsAsync: async () => {
                calls.push('get-background');
                return {granted: false};
            },
            requestBackgroundPermissionsAsync: async () => {
                calls.push('background');
                return background;
            },
        },
        'expo-network': {},
        'expo-task-manager': {},
        './constants': {LOCATION_PERMISSION_REQUESTED_KEY: 'test'},
        './sync': {},
        './task': {},
    };
    vm.runInNewContext(compiled, {
        module,
        exports: module.exports,
        require: (name) => {
            if (!mocks[name]) throw new Error(`Unexpected dependency: ${name}`);
            return mocks[name];
        },
    });
    return {api: module.exports, calls};
};

test('foreground location is requested before background location', async () => {
    const foreground = {granted: true};
    const background = {granted: true};
    const {api, calls} = createTracking({foreground, background});
    const result = await api.requestLocationTrackingPermissions();
    assert.equal(result.foreground, foreground);
    assert.equal(result.background, background);
    assert.deepEqual(calls, ['record-request', 'foreground', 'get-background', 'background']);
});

test('background location is not requested when foreground is denied', async () => {
    const {api, calls} = createTracking({foreground: {granted: false}});
    const result = await api.requestLocationTrackingPermissions();
    assert.equal(result.background.granted, false);
    assert.deepEqual(calls, ['record-request', 'foreground', 'get-background']);
});

test('iOS explains when Always permission is not granted', async () => {
    const {api} = createTracking({
        foreground: {granted: true, ios: {scope: 'whenInUse'}},
        background: {granted: false},
        platform: 'ios',
    });
    await assert.rejects(api.requestLocationTrackingPermissions(), /choose "Always"/);
});
