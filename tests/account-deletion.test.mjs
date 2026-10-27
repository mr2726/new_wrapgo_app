import test from 'node:test';
import assert from 'node:assert/strict';
import {deleteAccount, storagePathFromUrl, DeletionError} from '../supabase/functions/_shared/deletion.ts';
import {handleDeleteAccount} from '../supabase/functions/_shared/handler.ts';

const BASE = 'https://x.supabase.co/storage/v1/object/public/documents/';

// Minimal in-memory stand-in for the service-role client.
const makeAdmin = ({users = {}, tables = {}, files = {}, failOn = null} = {}) => {
  const ops = [];
  const db = JSON.parse(JSON.stringify(tables));
  const store = new Set(Object.keys(files));
  const fail = (key) => (failOn === key ? {message: `boom ${key}`, code: 'XX000'} : null);

  const from = (table) => {
    let mode = 'select';
    let patch;
    const q = {
      select() { mode = 'select'; return q; },
      update(p) { mode = 'update'; patch = p; return q; },
      delete() { mode = 'delete'; return q; },
      eq(col, val) {
        const err = fail(`${mode}:${table}`);
        const rows = db[table] || [];
        const matches = rows.filter((r) => r[col] === val);
        ops.push({table, mode, col, val});
        if (err) return Promise.resolve({data: null, error: err});
        if (mode === 'delete') db[table] = rows.filter((r) => r[col] !== val);
        if (mode === 'update') matches.forEach((r) => Object.assign(r, patch));
        return Promise.resolve({data: matches, error: null});
      },
    };
    return q;
  };

  const bucket = {
    list: async (prefix, {limit = 1000, offset = 0} = {}) => {
      const err = fail('storage:list');
      if (err) return {data: null, error: err};
      const names = [...store].filter((p) => p.startsWith(`${prefix}/`)).map((p) => p.slice(prefix.length + 1));
      const direct = new Map();
      for (const n of names) {
        const [head, ...rest] = n.split('/');
        direct.set(head, rest.length ? null : {size: 1});
      }
      const entries = [...direct]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([name, metadata]) => ({name, metadata}));
      return {data: entries.slice(offset, offset + limit), error: null};
    },
    remove: async (paths) => {
      const err = fail('storage:remove');
      if (err) return {data: null, error: err};
      paths.forEach((p) => store.delete(p));
      return {data: [], error: null};
    },
  };

  const deleted = [];
  return {
    ops, db, store, deleted,
    from,
    storage: {from: () => bucket},
    auth: {
      getUser: async (token) => (users[token] ? {data: {user: users[token]}, error: null} : {data: {user: null}, error: {message: 'invalid JWT'}}),
      admin: {
        listUsers: async ({page = 1, perPage = 1000} = {}) => ({
          data: {
            users: Object.values(users).slice((page - 1) * perPage, page * perPage),
          },
          error: null,
        }),
        deleteUser: async (id) => {
          const err = fail('auth:delete');
          if (err) return {error: err};
          if (deleted.includes(id)) return {error: {status: 404, code: 'user_not_found', message: 'User not found'}};
          deleted.push(id);
          return {error: null};
        },
      },
    },
  };
};

const alice = {id: 'u-alice', email: 'alice@example.com', email_confirmed_at: '2026-01-01'};
const bob = {id: 'u-bob', email: 'bob@example.com', email_confirmed_at: '2026-01-01'};

const seed = () => ({
  tables: {
    drivers: [
      {userid: 'u-alice', email: 'alice@example.com', selfie: `${BASE}vehicle-documents/alice%40example.com/selfie.jpg`},
      {userid: 'u-bob', email: 'bob@example.com', selfie: `${BASE}vehicle-documents/bob%40example.com/selfie.jpg`},
    ],
    vehicles: [
      {invite_code: 'A1', signeddriveremail: 'alice@example.com', left_img: `${BASE}vehicle-documents/A1/wrap-left.jpg`, used: true},
      {invite_code: 'B1', signeddriveremail: 'bob@example.com', left_img: null, used: true},
    ],
    fleet_signed_contracts: [{driver_email: 'alice@example.com'}, {driver_email: 'bob@example.com'}],
    driver_location_updates: [{user_id: 'u-alice', driver_email: 'alice@example.com'}, {user_id: 'u-bob', driver_email: 'bob@example.com'}],
  },
  files: {
    'vehicle-documents/alice@example.com/selfie.jpg': 1,
    'vehicle-documents/alice@example.com/left-1.jpg': 1,
    'vehicle-documents/A1/wrap-left.jpg': 1,
    'vehicle-documents/bob@example.com/selfie.jpg': 1,
  },
});

const post = (token) =>
  new Request('https://f/delete_account', {
    method: 'POST',
    headers: token ? {Authorization: `Bearer ${token}`} : {},
    body: JSON.stringify({userId: 'u-bob', email: 'bob@example.com'}),
  });

const postBody = (body, token = null) =>
  new Request('https://f/delete_account', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? {Authorization: `Bearer ${token}`} : {}),
    },
    body: JSON.stringify(body),
  });

test('authenticated user: deletes own data, keeps others, releases fleet vehicle', async () => {
  const admin = makeAdmin({users: {tA: alice}, ...seed()});
  const res = await handleDeleteAccount(post('tA'), admin);
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), {success: true});
  assert.deepEqual(admin.db.drivers.map((r) => r.userid), ['u-bob']);
  assert.equal(admin.db.fleet_signed_contracts.length, 1);
  assert.equal(admin.db.driver_location_updates.length, 1);
  assert.equal(admin.db.vehicles.length, 2); // fleet record kept
  const released = admin.db.vehicles.find((v) => v.invite_code === 'A1');
  assert.equal(released.signeddriveremail, null);
  assert.equal(released.used, false);
  assert.deepEqual([...admin.store], ['vehicle-documents/bob@example.com/selfie.jpg']);
  assert.deepEqual(admin.deleted, ['u-alice']);
});

test('client-supplied user id / email in body is ignored (cannot delete another user)', async () => {
  const admin = makeAdmin({users: {tA: alice}, ...seed()});
  await handleDeleteAccount(post('tA'), admin);
  assert.ok(admin.db.drivers.some((r) => r.userid === 'u-bob'));
  assert.ok(!admin.deleted.includes('u-bob'));
});

test('missing, invalid or expired token is rejected before touching data', async () => {
  const admin = makeAdmin({users: {tA: alice}, ...seed()});
  for (const token of [null, 'expired']) {
    const res = await handleDeleteAccount(post(token), admin);
    assert.equal(res.status, 401);
  }
  assert.equal(admin.ops.length, 0);
  assert.equal(admin.deleted.length, 0);
});

test('non-POST is rejected, OPTIONS answers CORS preflight', async () => {
  const admin = makeAdmin();
  assert.equal((await handleDeleteAccount(new Request('https://f/', {method: 'GET'}), admin)).status, 405);
  assert.equal((await handleDeleteAccount(new Request('https://f/', {method: 'OPTIONS'}), admin)).status, 200);
});

test('fixed deletion code is accepted only for the configured test account email', async () => {
  const admin = makeAdmin({users: {tA: alice}, ...seed()});
  const accountCheck = await handleDeleteAccount(
    postBody({action: 'check_test_account', email: 'ALICE@example.com'}, 'public-anon-key'),
    admin,
    'alice@example.com',
  );
  assert.deepEqual(await accountCheck.json(), {testAccount: true});

  const verified = await handleDeleteAccount(
    postBody({action: 'verify_test_code', email: 'alice@example.com', test_code: '123456'}, 'public-anon-key'),
    admin,
    'alice@example.com',
  );
  assert.deepEqual(await verified.json(), {verified: true});

  for (const [email, code] of [['bob@example.com', '123456'], ['alice@example.com', '000000']]) {
    const invalid = await handleDeleteAccount(
      postBody({action: 'verify_test_code', email, test_code: code}, 'public-anon-key'),
      admin,
      'alice@example.com',
    );
    assert.equal(invalid.status, 401);
  }
  assert.equal(admin.ops.length, 0);
  assert.equal(admin.deleted.length, 0);
});

test('test deletion requires confirmation and deletes only the configured account', async () => {
  const admin = makeAdmin({users: {tA: alice, tB: bob}, ...seed()});
  const configEmail = 'alice@example.com';

  const unconfirmed = await handleDeleteAccount(
    postBody({
      action: 'delete_test_account',
      email: configEmail,
      test_code: '123456',
      confirm: false,
    }, 'public-anon-key'),
    admin,
    configEmail,
  );
  assert.equal(unconfirmed.status, 401);
  assert.deepEqual(admin.deleted, []);

  const deleted = await handleDeleteAccount(
    postBody({
      action: 'delete_test_account',
      email: configEmail,
      test_code: '123456',
      confirm: true,
    }, 'public-anon-key'),
    admin,
    configEmail,
  );
  assert.equal(deleted.status, 200);
  assert.deepEqual(admin.deleted, ['u-alice']);
  assert.deepEqual(admin.db.drivers.map((r) => r.userid), ['u-bob']);
});

test('unconfirmed email is never used to match data (prevents deleting a victim by email)', async () => {
  const admin = makeAdmin({users: {tM: {id: 'u-mallory', email: 'bob@example.com', email_confirmed_at: null}}, ...seed()});
  const res = await handleDeleteAccount(post('tM'), admin);
  assert.equal(res.status, 200);
  assert.equal(admin.db.drivers.length, 2);
  assert.equal(admin.db.fleet_signed_contracts.length, 2);
  assert.equal(admin.store.size, 4);
  assert.deepEqual(admin.deleted, ['u-mallory']);
});

test('missing driver profile still deletes the auth user', async () => {
  const admin = makeAdmin({users: {tN: {id: 'u-new', email: 'new@example.com', email_confirmed_at: 'x'}}, ...seed()});
  const res = await handleDeleteAccount(post('tN'), admin);
  assert.equal(res.status, 200);
  assert.deepEqual(admin.deleted, ['u-new']);
});

test('storage pagination removes files beyond the first 1000 objects', async () => {
  const files = Object.fromEntries(
    Array.from({length: 1001}, (_, index) => [
      `vehicle-documents/alice@example.com/file-${String(index).padStart(4, '0')}.jpg`,
      1,
    ]),
  );
  const admin = makeAdmin({
    users: {tA: alice},
    tables: {drivers: [{userid: alice.id, email: alice.email, selfie: null}]},
    files,
  });

  const res = await handleDeleteAccount(post('tA'), admin);
  assert.equal(res.status, 200);
  assert.equal(admin.store.size, 0);
  assert.deepEqual(admin.deleted, [alice.id]);
});

for (const failOn of ['storage:remove', 'storage:list', 'delete:fleet_signed_contracts', 'delete:drivers', 'update:vehicles', 'select:drivers']) {
  test(`failure at ${failOn}: reports error, keeps auth user so it can be retried, retry succeeds`, async () => {
    const data = seed();
    const failing = makeAdmin({users: {tA: alice}, ...data, failOn});
    const res = await handleDeleteAccount(post('tA'), failing);
    assert.equal(res.status, 500);
    const body = await res.json();
    assert.equal(body.error, 'deletion_incomplete');
    assert.equal(body.retryable, true);
    assert.equal(failing.deleted.length, 0, 'auth user must survive a partial failure');
    assert.ok(!JSON.stringify(body).includes('alice'), 'no PII in response');

    const retry = makeAdmin({users: {tA: alice}, tables: failing.db, files: Object.fromEntries([...failing.store].map((f) => [f, 1]))});
    const ok = await handleDeleteAccount(post('tA'), retry);
    assert.equal(ok.status, 200);
    assert.deepEqual(retry.deleted, ['u-alice']);
  });
}

test('auth user deletion failure is surfaced, not reported as success', async () => {
  const admin = makeAdmin({users: {tA: alice}, ...seed(), failOn: 'auth:delete'});
  const res = await handleDeleteAccount(post('tA'), admin);
  assert.equal(res.status, 500);
  assert.equal((await res.json()).step, 'auth_user');
});

test('duplicate / retried request after success is idempotent at the data layer', async () => {
  const admin = makeAdmin({users: {tA: alice}, ...seed()});
  await deleteAccount(admin, alice);
  await deleteAccount(admin, alice); // second deleteUser returns user_not_found -> treated as done
  assert.deepEqual(admin.deleted, ['u-alice']);
});

test('errors never leak tokens into logs', async () => {
  const logs = [];
  const original = console.error;
  console.error = (...args) => logs.push(JSON.stringify(args));
  try {
    const admin = makeAdmin({users: {secretToken123: alice}, ...seed(), failOn: 'delete:drivers'});
    await handleDeleteAccount(post('secretToken123'), admin);
  } finally {
    console.error = original;
  }
  assert.equal(logs.length, 1);
  assert.ok(!logs[0].includes('secretToken123'));
  assert.ok(!logs[0].includes('alice@example.com'));
});

test('storagePathFromUrl only accepts files under vehicle-documents and rejects traversal', () => {
  assert.equal(storagePathFromUrl(`${BASE}vehicle-documents/a%40b.com/x.jpg`), 'vehicle-documents/a@b.com/x.jpg');
  assert.equal(storagePathFromUrl(`${BASE}other/x.jpg`), null);
  assert.equal(storagePathFromUrl(`${BASE}vehicle-documents/../x.jpg`), null);
  assert.equal(storagePathFromUrl(null), null);
  assert.equal(storagePathFromUrl('https://evil.example/x.jpg'), null);
});

test('DeletionError carries the failing step', () => {
  assert.equal(new DeletionError('drivers', new Error('x')).step, 'drivers');
});
