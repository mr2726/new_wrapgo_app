import { createClient } from 'npm:@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });

const listAllFilesUnderPrefix = async (bucket: string, prefix: string) => {
  const queue = [prefix];
  const filePaths: string[] = [];

  while (queue.length > 0) {
    const currentPrefix = queue.shift() ?? '';
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .list(currentPrefix, {
        limit: 1000,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' },
      });

    if (error) {
      const message = String(error.message || '').toLowerCase();
      if (message.includes('not found')) {
        continue;
      }
      throw error;
    }

    for (const item of data || []) {
      const fullPath = currentPrefix ? `${currentPrefix}/${item.name}` : item.name;

      if (item?.metadata) {
        filePaths.push(fullPath);
      } else {
        queue.push(fullPath);
      }
    }
  }

  return filePaths;
};

const removeFilesByPrefixes = async (
  bucket: string,
  prefixes: Array<string | null | undefined>,
) => {
  const allFiles: string[] = [];

  for (const prefix of prefixes) {
    if (!prefix) continue;
    const files = await listAllFilesUnderPrefix(bucket, prefix);
    allFiles.push(...files);
  }

  if (allFiles.length === 0) {
    return;
  }

  const chunkSize = 100;
  for (let index = 0; index < allFiles.length; index += chunkSize) {
    const chunk = allFiles.slice(index, index + chunkSize);
    const { error } = await supabaseAdmin.storage.from(bucket).remove(chunk);
    if (error) {
      throw error;
    }
  }
};

Deno.serve(async (request) => {
  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  const authorizationHeader = request.headers.get('Authorization');
  if (!authorizationHeader) {
    return jsonResponse({ error: 'Missing authorization token.' }, 401);
  }

  const token = authorizationHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) {
    return jsonResponse({ error: 'Missing authorization token.' }, 401);
  }

  const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError) {
    return jsonResponse({ error: authError.message }, 401);
  }

  const user = authData?.user;
  if (!user?.id || !user?.email) {
    return jsonResponse({ error: 'Authenticated user not found.' }, 401);
  }

  const body = await request.json().catch(() => ({}));
  const storageBucket = typeof body?.storageBucket === 'string' && body.storageBucket.trim()
    ? body.storageBucket.trim()
    : 'documents';
  const storagePrefix = typeof body?.storagePrefix === 'string' && body.storagePrefix.trim()
    ? body.storagePrefix.trim()
    : 'vehicle-documents';

  const emailFolderPrefix = `${storagePrefix}/${user.email}`;
  await removeFilesByPrefixes(storageBucket, [emailFolderPrefix, user.email]);

  const { error: vehiclesDeleteError } = await supabaseAdmin
    .from('vehicles')
    .delete()
    .eq('signeddriveremail', user.email);

  if (vehiclesDeleteError) {
    return jsonResponse({ error: vehiclesDeleteError.message }, 500);
  }

  const { error: driversDeleteByUserError } = await supabaseAdmin
    .from('drivers')
    .delete()
    .eq('userid', user.id);

  if (driversDeleteByUserError) {
    return jsonResponse({ error: driversDeleteByUserError.message }, 500);
  }

  const { error: driversDeleteByEmailError } = await supabaseAdmin
    .from('drivers')
    .delete()
    .eq('email', user.email);

  if (driversDeleteByEmailError) {
    return jsonResponse({ error: driversDeleteByEmailError.message }, 500);
  }

  const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
  if (deleteAuthError) {
    return jsonResponse({ error: deleteAuthError.message }, 500);
  }

  return jsonResponse({ success: true, warnings: [] });
});
