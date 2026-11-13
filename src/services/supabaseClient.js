import { IS_COMMUNITY_ENABLED, SUPABASE } from '../config';

let clientPromise = null;

/** Lazily loads the Supabase client (separate chunk) and only when credentials exist. Resolves to null otherwise. */
export function getSupabase() {
  if (!IS_COMMUNITY_ENABLED) return Promise.resolve(null);
  if (!clientPromise) {
    clientPromise = import('@supabase/supabase-js').then(({ createClient }) =>
      createClient(SUPABASE.url, SUPABASE.anonKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }),
    );
  }
  return clientPromise;
}
