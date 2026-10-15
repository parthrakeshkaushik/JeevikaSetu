import { createClient, SupabaseClient } from '@supabase/supabase-js';

// User's Supabase project instance
const SUPABASE_PROJECT_URL =
  (import.meta as any).env?.VITE_SUPABASE_URL || 'https://wrnkpwgaygydbekdpfmg.supabase.co';

const BUILTIN_ANON_KEY = 'sb_publishable_mQGOBMU_iSMFaKe9KPAKSA_MkcVvmtP';

export const getSupabaseAnonKey = (): string => {
  try {
    return (
      (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
      (import.meta as any).env?.VITE_SUPABASE_PUBLISHABLE_KEY ||
      localStorage.getItem('jeevikasetu_supabase_anon_key') ||
      BUILTIN_ANON_KEY
    ).trim();
  } catch {
    return BUILTIN_ANON_KEY;
  }
};

export const setSupabaseAnonKey = (key: string): void => {
  try {
    if (key && key.trim()) {
      localStorage.setItem('jeevikasetu_supabase_anon_key', key.trim());
    }
  } catch (e) {
    console.warn('Could not persist anon key in localStorage:', e);
  }
};

/**
 * Returns true if the Supabase project URL and anon public key are properly configured.
 */
export const isSupabaseConfigured = (): boolean => {
  const key = getSupabaseAnonKey();
  return Boolean(key && key.length > 20);
};

export const getSupabaseProjectUrl = (): string => {
  return SUPABASE_PROJECT_URL;
};

// Internal active client cache
let activeSupabaseClient: SupabaseClient | null = null;
let lastUsedKey: string | null = null;

export const getSupabaseClient = (): SupabaseClient => {
  const currentKey = getSupabaseAnonKey();
  if (!activeSupabaseClient || lastUsedKey !== currentKey) {
    lastUsedKey = currentKey;
    activeSupabaseClient = createClient(
      SUPABASE_PROJECT_URL,
      currentKey || 'placeholder-anon-key-configure-in-env',
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
  }
  return activeSupabaseClient;
};

export const supabase = getSupabaseClient();
