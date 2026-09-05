import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const isConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'your_supabase_url' &&
  supabaseAnonKey !== 'your_supabase_anon_key'
);

const createMockSupabaseClient = () => {
  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
      signUp: async () => ({ data: { user: null, session: null }, error: new Error('Supabase project URL and API key are required.') }),
      signInWithPassword: async () => ({ data: { user: null, session: null }, error: new Error('Supabase project URL and API key are required.') }),
      signInWithOAuth: async () => ({ data: null, error: new Error('Supabase project URL and API key are required.') }),
      signOut: async () => ({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      mfa: {
        enroll: async () => ({ data: null, error: new Error('Supabase MFA not configured.') }),
        challenge: async () => ({ data: null, error: new Error('Supabase MFA not configured.') }),
        verify: async () => ({ data: null, error: new Error('Supabase MFA not configured.') }),
      }
    }
  } as any;
};

export const createClient = () => {
  if (!isConfigured) {
    return createMockSupabaseClient();
  }

  try {
    return createBrowserClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
  } catch (err) {
    return createMockSupabaseClient();
  }
};
