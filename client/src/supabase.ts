import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Default Supabase project instance
const DEFAULT_SUPABASE_PROJECT_URL =
  (import.meta as any).env?.VITE_SUPABASE_URL || 'https://wrnkpwgaygydbekdpfmg.supabase.co';

const BUILTIN_ANON_KEY = 'sb_publishable_mQGOBMU_iSMFaKe9KPAKSA_MkcVvmtP';

export const getSupabaseProjectUrl = (): string => {
  try {
    return (
      localStorage.getItem('jeevikasetu_supabase_url') ||
      (import.meta as any).env?.VITE_SUPABASE_URL ||
      DEFAULT_SUPABASE_PROJECT_URL
    ).trim().replace(/\/+$/, '');
  } catch {
    return DEFAULT_SUPABASE_PROJECT_URL;
  }
};

export const setSupabaseProjectUrl = (url: string): void => {
  try {
    if (url && url.trim()) {
      localStorage.setItem('jeevikasetu_supabase_url', url.trim().replace(/\/+$/, ''));
      activeSupabaseClient = null;
      lastUsedUrl = null;
    }
  } catch (e) {
    console.warn('Could not persist project URL in localStorage:', e);
  }
};

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
      activeSupabaseClient = null;
      lastUsedKey = null;
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

/**
 * Pre-flight health check to verify if the Supabase project is active or paused.
 * This prevents the browser from blindly navigating to an unresolvable URL and displaying "This site can't be reached".
 */
export const checkSupabaseHealth = async (): Promise<{
  isOnline: boolean;
  projectUrl: string;
  isPaused: boolean;
  error?: string;
}> => {
  const url = getSupabaseProjectUrl();
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);

    // Fetch the auth health endpoint
    await fetch(`${url}/auth/v1/health`, {
      method: 'GET',
      mode: 'no-cors',
      cache: 'no-store',
      signal: controller.signal,
    });
    clearTimeout(timer);

    return { isOnline: true, projectUrl: url, isPaused: false };
  } catch (err: any) {
    const isTimeout = err?.name === 'AbortError';
    return {
      isOnline: false,
      projectUrl: url,
      isPaused: true,
      error: isTimeout
        ? 'Supabase सर्वर कनेक्शन समय समाप्त (Timeout)'
        : 'Supabase प्रोजेक्ट डोमेन कनेक्ट नहीं हो पा रहा है (संभावित Paused स्थिति)',
    };
  }
};

// Internal active client cache
let activeSupabaseClient: SupabaseClient | null = null;
let lastUsedKey: string | null = null;
let lastUsedUrl: string | null = null;

export const getSupabaseClient = (): SupabaseClient => {
  const currentKey = getSupabaseAnonKey();
  const currentUrl = getSupabaseProjectUrl();
  if (!activeSupabaseClient || lastUsedKey !== currentKey || lastUsedUrl !== currentUrl) {
    lastUsedKey = currentKey;
    lastUsedUrl = currentUrl;
    activeSupabaseClient = createClient(
      currentUrl,
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
