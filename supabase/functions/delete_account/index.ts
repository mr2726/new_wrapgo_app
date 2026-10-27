import { createClient } from 'npm:@supabase/supabase-js@2';
import { handleDeleteAccount } from '../_shared/handler.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Set this Supabase secret to the dedicated store-review account's email.
const testAccountEmail = Deno.env.get('ACCOUNT_DELETION_TEST_EMAIL');

Deno.serve((request) =>
  handleDeleteAccount(request, supabaseAdmin, testAccountEmail),
);
