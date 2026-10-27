import { DeletionError, deleteAccount, type DeletableUser } from './deletion.ts';

// deno-lint-ignore no-explicit-any
type AdminClient = any;

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export const TEST_ACCOUNT_DELETION_CODE = '123456';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const normalizeEmail = (value: unknown) =>
  typeof value === 'string' ? value.trim().toLowerCase() : '';

const isTestAccountEmail = (value: unknown, testAccountEmail: string | undefined) => {
  const email = normalizeEmail(value);
  return Boolean(testAccountEmail && email && email === normalizeEmail(testAccountEmail));
};

const isValidTestCode = (body: Record<string, unknown>, testAccountEmail: string | undefined) =>
  isTestAccountEmail(body.email, testAccountEmail) &&
  body.test_code === TEST_ACCOUNT_DELETION_CODE;

const findTestAccount = async (admin: AdminClient, email: string) => {
  for (let page = 1; ; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;

    const user = data?.users?.find(
      (candidate: { email?: string | null }) => normalizeEmail(candidate.email) === email,
    );
    if (user) return user;
    if (!data?.users || data.users.length < 1000) return null;
  }
};

const deleteUser = async (admin: AdminClient, user: DeletableUser) => {
  try {
    await deleteAccount(admin, user);
    return json({ success: true });
  } catch (failure) {
    // Never log tokens or personal data: only the user id and the failing step.
    const stepName = failure instanceof DeletionError ? failure.step : 'unknown';
    const cause = failure instanceof DeletionError ? failure.cause : failure;
    console.error('account_deletion_failed', {
      userId: user.id,
      step: stepName,
      code: (cause as { code?: string })?.code ?? null,
      message: (cause as { message?: string })?.message ?? null,
    });
    return json({ error: 'deletion_incomplete', step: stepName, retryable: true }, 500);
  }
};

const handleTestAccountAction = async (
  body: Record<string, unknown>,
  admin: AdminClient,
  testAccountEmail?: string,
): Promise<Response | null> => {
  if (body.action === 'check_test_account') {
    return json({ testAccount: isTestAccountEmail(body.email, testAccountEmail) });
  }
  if (body.action === 'verify_test_code') {
    return isValidTestCode(body, testAccountEmail)
      ? json({ verified: true })
      : json({ error: 'invalid_test_code' }, 401);
  }
  if (body.action !== 'delete_test_account') return null;
  if (!isValidTestCode(body, testAccountEmail) || body.confirm !== true) {
    return json({ error: 'unauthorized' }, 401);
  }

  const email = normalizeEmail(body.email);
  let user;
  try {
    user = await findTestAccount(admin, email);
  } catch (error) {
    console.error('test_account_lookup_failed', {
      code: (error as { code?: string })?.code ?? null,
      message: (error as { message?: string })?.message ?? null,
    });
    return json({ error: 'account_lookup_failed' }, 500);
  }
  if (!user?.id) return json({ error: 'account_not_found' }, 404);
  return deleteUser(admin, user);
};

// Authenticated requests always delete the bearer token's verified user; the
// test-account flow is separately restricted to a server-configured email.
export const handleDeleteAccount = async (
  request: Request,
  admin: AdminClient,
  testAccountEmail?: string,
) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const token = (request.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '').trim();
  if (token) {
    let body: unknown = null;
    try {
      body = await request.clone().json();
    } catch {
      // The authenticated deletion request does not require a body.
    }
    if (isRecord(body)) {
      const testAccountResponse = await handleTestAccountAction(body, admin, testAccountEmail);
      if (testAccountResponse) return testAccountResponse;
    }
  } else {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return json({ error: 'invalid_request' }, 400);
    }
    if (!isRecord(body)) return json({ error: 'invalid_request' }, 400);

    const testAccountResponse = await handleTestAccountAction(body, admin, testAccountEmail);
    if (testAccountResponse) return testAccountResponse;
    return json({ error: 'unauthorized' }, 401);
  }

  const { data, error } = await admin.auth.getUser(token);
  const user = data?.user;
  if (error || !user?.id) return json({ error: 'unauthorized' }, 401);

  return deleteUser(admin, user);
};
