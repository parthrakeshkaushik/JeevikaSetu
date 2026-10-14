import { createClient } from '@supabase/supabase-js';

// User's Supabase project instance
const SUPABASE_PROJECT_URL =
  (import.meta as any).env?.VITE_SUPABASE_URL || 'https://wrnkpwgaygydbekdpfmg.supabase.co';

const SUPABASE_ANON_KEY =
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

/**
 * Returns true if the Supabase project URL and anon public key are properly configured.
 */
export const isSupabaseConfigured = (): boolean => {
  return Boolean(SUPABASE_ANON_KEY && SUPABASE_ANON_KEY.trim().length > 10);
};

export const getSupabaseProjectUrl = (): string => {
  return SUPABASE_PROJECT_URL;
};

// Initialize the official Supabase JS client
// Fallback placeholder prevents module instantiation crash if env var is missing during initial setup
export const supabase = createClient(
  SUPABASE_PROJECT_URL,
  SUPABASE_ANON_KEY || 'placeholder-anon-key-configure-in-env',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      storage: window.localStorage,
    },
  }
);
