import { createClient } from '@supabase/supabase-js';

// Client-side Supabase client (uses anon key)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || '';

if (!supabaseUrl || !supabaseAnonKey) {
  const errorMsg = `❌ Missing Supabase environment variables!

Please ensure these are set in your .env.local file:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY

Current values:
- NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl || 'MISSING'}
- NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey ? 'Set (hidden)' : 'MISSING'}

⚠️ IMPORTANT: Restart your dev server after adding/changing .env.local variables!
Run: npm run dev`;
  
  console.error(errorMsg);
  // Don't throw - create placeholder client to prevent app crash
  // The app will show errors in UI instead
}

// Only create client if both values are present (prevents "supabaseKey is required" error)
// Use placeholder if missing (will fail at runtime but won't crash app initialization)
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://placeholder.supabase.co', 'placeholder-key');

// Server-side Supabase client (uses service role key for admin operations)
// Only use this in API routes, never expose to client
// Note: SUPABASE_SERVICE_ROLE_KEY is intentionally not available client-side (security)
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || '';

// Only warn if we're server-side and the key is missing
if (typeof window === 'undefined' && !serviceRoleKey) {
  console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY is missing. Admin operations in API routes may fail.');
  console.warn('   Make sure SUPABASE_SERVICE_ROLE_KEY is set in .env.local and restart the dev server.');
}

// Create admin client - use placeholder if key is missing (will fail at runtime, but won't break route registration)
export const supabaseAdmin = serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : createClient(supabaseUrl, 'placeholder-key', {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
