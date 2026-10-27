// Writes web/delete-account/config.js from environment variables at deploy time.
// The Supabase URL and anon key are public by design; the service_role key must never be used here.
import {writeFileSync} from 'node:fs';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.');
  process.exit(1);
}

writeFileSync(
  new URL('../delete-account/config.js', import.meta.url),
  `window.WRAPGO_CONFIG = ${JSON.stringify({supabaseUrl: url, supabaseAnonKey: key})};\n`
);
console.log('config.js written');
