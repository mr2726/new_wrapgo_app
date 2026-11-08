const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const babel = require('@babel/core');

const sourcePath = path.join(__dirname, '..', 'src', 'components', 'service', 'photoPermissions.js');
const source = fs.readFileSync(sourcePath, 'utf8');
const compiled = babel.transformSync(source, {
    babelrc: false,
    configFile: false,
    plugins: ['@babel/plugin-transform-modules-commonjs'],
}).code;

const createPermissions = ({camera, library, openSettings = async () => {}}) => {
    const alerts = [];
    const requests = [];
    const module = {exports: {}};
    const mocks = {
        'react-native': {
            Alert: {alert: (...args) => alerts.push(args)},
            Linking: {openSettings},
        },
        'expo-image-picker': {
            requestCameraPermissionsAsync: async () => {
                requests.push('camera');
                return camera();
            },
            requestMediaLibraryPermissionsAsync: async () => {
                requests.push('library');
                return library();
            },
        },
    };
    vm.runInNewContext(compiled, {
        module,
        exports: module.exports,
        require: (name) => {
            if (!mocks[name]) throw new Error(`Unexpected dependency: ${name}`);
            return mocks[name];
        },
    });
    return {api: module.exports, alerts, requests};
};

test('granted camera and photo library permissions use the correct requests', async () => {
    const grant = () => ({granted: true, canAskAgain: true});
    const {api, alerts, requests} = createPermissions({camera: grant, library: grant});
    assert.equal(await api.requestPhotoPermission('camera'), true);
    assert.equal(await api.requestPhotoPermission('library'), true);
    assert.deepEqual(requests, ['camera', 'library']);
    assert.equal(alerts.length, 0);
});

test('a retryable denial reports that permission is required', async () => {
    const deny = () => ({granted: false, canAskAgain: true});
    const {api, alerts} = createPermissions({camera: deny, library: deny});
    assert.equal(await api.requestPhotoPermission('library'), false);
    assert.equal(alerts[0][0], 'Permission required');
    assert.match(alerts[0][1], /photo library/);
});

test('a blocked permission offers settings and reports failures to open them', async () => {
    const deny = () => ({granted: false, canAskAgain: false});
    const {api, alerts} = createPermissions({
        camera: deny,
        library: deny,
        openSettings: async () => { throw new Error('Settings unavailable'); },
    });
    assert.equal(await api.requestPhotoPermission('camera'), false);
    assert.equal(alerts[0][0], 'Camera permission blocked');
    alerts[0][2][1].onPress();
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(alerts[1][0], 'Could not open settings');
    assert.equal(alerts[1][1], 'Settings unavailable');
});

test('permission request failures are propagated to the caller', async () => {
    const fail = () => { throw new Error('Permission request failed'); };
    const {api} = createPermissions({camera: fail, library: fail});
    await assert.rejects(api.requestPhotoPermission('camera'), /Permission request failed/);
});
