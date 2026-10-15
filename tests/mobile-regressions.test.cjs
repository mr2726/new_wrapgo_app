const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
const root = path.resolve(__dirname, '..');
const service = fs.readFileSync(path.join(root, 'src/components/service/service.js'), 'utf8');
const contracts = fs.readFileSync(path.join(root, 'src/Pages/Content/Contracts.js'), 'utf8');

// Execute the existing functions with isolated service/state dependencies, without
// requiring a native runtime. Device rendering and Auth integration remain UAT.
const passwordMatch = service.match(/export const changePassword = async \(newPassword\) => \{([\s\S]*?)\n\};/);
assert.ok(passwordMatch, 'Locate actual password service implementation');
const changePassword = new AsyncFunction('supabase', 'newPassword', passwordMatch[1]);

test('password update rejection reaches caller so UI cannot display success', async () => {
    const error = new Error('Session expired');
    const supabase = {auth: {updateUser: async () => ({error})}};
    await assert.rejects(changePassword(supabase, 'valid-password'), (caught) => caught === error);
});

test('confirmed password update passes the supplied password once', async () => {
    const calls = [];
    const supabase = {auth: {updateUser: async (payload) => {calls.push(payload); return {error: null};}}};
    await changePassword(supabase, 'valid-password');
    assert.deepEqual(calls, [{password: 'valid-password'}]);
});

const loaderMatch = contracts.match(/const loadDriverContracts = useCallback\(async \(\) => \{([\s\S]*?)\n    \}, \[\]\);/);
assert.ok(loaderMatch, 'Locate actual Contracts loading callback');
const load = new AsyncFunction('AsyncStorage', 'setSignedContracts', 'setErrorMessage', 'setLoading', 'getSignedContracts', 'console', loaderMatch[1]);
const runLoader = async (cache, query) => {
    const rows = [], errors = [], loading = [];
    await load({getItem: async () => cache}, (v) => rows.push(v), (v) => errors.push(v), (v) => loading.push(v), query, {error() {}});
    return {rows, errors, loading};
};

test('missing cached user produces clean empty contracts, without ReferenceError', async () => {
    const result = await runLoader(null, async () => {throw new Error('Must not query without user');});
    assert.deepEqual(result.rows, [[]]);
    assert.deepEqual(result.errors, ['']);
    assert.deepEqual(result.loading, [true, false]);
});

test('valid cache loads contracts for cached identity and clears loading', async () => {
    const records = [{id: 1, status: 'active'}];
    const result = await runLoader(JSON.stringify({email: 'test@example.invalid'}), async (args) => {
        assert.equal(args.email, 'test@example.invalid');
        return records;
    });
    assert.deepEqual(result.rows, [records]);
    assert.deepEqual(result.errors, ['']);
    assert.equal(result.loading.at(-1), false);
});

test('backend contract failure remains visible and clears loading', async () => {
    const result = await runLoader(JSON.stringify({email: 'test@example.invalid'}), async () => {throw new Error('Network unavailable');});
    assert.deepEqual(result.errors, ['', 'Network unavailable']);
    assert.equal(result.loading.at(-1), false);
});
