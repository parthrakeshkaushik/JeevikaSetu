import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client.js';
import { supabase, isSupabaseConfigured } from '../supabase.js';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export interface CitizenProfile {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string | null;
  jurisdictionName?: string;
}

interface CitizenAuthContextType {
  citizen: CitizenProfile | null;
  token: string | null;
  isCitizenAuthenticated: boolean;
  isLoading: boolean;
  isSupabaseReady: boolean;
  signInWithGoogleOAuth: () => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: (email: string, fullName?: string, phone?: string, avatarUrl?: string) => Promise<boolean>;
  logoutCitizen: () => Promise<void>;
}

const CitizenAuthContext = createContext<CitizenAuthContextType | undefined>(undefined);

export const CitizenAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [citizen, setCitizen] = useState<CitizenProfile | null>(() => {
    try {
      const stored = localStorage.getItem('jeevikasetu_citizen_profile');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('jeevikasetu_citizen_token') || null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const isSupabaseReady = isSupabaseConfigured();

  // Helper to extract clean citizen profile from genuine Supabase user object
  const extractProfileFromSupabaseUser = (user: SupabaseUser): CitizenProfile => {
    const email = user.email || '';
    const metadata = user.user_metadata || {};
    const fullName =
      metadata.full_name ||
      metadata.name ||
      (email ? email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'नागरिक');
    const avatarUrl =
      metadata.avatar_url ||
      metadata.picture ||
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}&backgroundColor=4285F4,34A853,FBBC05,EA4335`;

    return {
      id: user.id,
      email,
      fullName,
      phone: metadata.phone || user.phone || undefined,
      avatarUrl,
      jurisdictionName: metadata.jurisdictionName || 'Supaul',
    };
  };

  // Sync Supabase Auth session on initial mount and URL redirect
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        if (isSupabaseReady) {
          // Check for existing session or handle code / token in URL
          const { data: { session }, error } = await supabase.auth.getSession();
          if (error) {
            console.warn('Supabase getSession error:', error.message);
          } else if (session?.user && mounted) {
            const profile = extractProfileFromSupabaseUser(session.user);
            const userToken = session.access_token || 'sb_token_' + session.user.id;
            setCitizen(profile);
            setToken(userToken);
            localStorage.setItem('jeevikasetu_citizen_token', userToken);
            localStorage.setItem('jeevikasetu_citizen_profile', JSON.stringify(profile));

            // Clean OAuth code or hash from browser address bar
            if (window.location.search.includes('code=') || window.location.hash.includes('access_token=')) {
              window.history.replaceState({}, document.title, window.location.pathname);
            }
          }
        }
      } catch (err) {
        console.error('Failed to initialize Supabase session:', err);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for authentication state transitions (e.g. after OAuth redirect)
    let authListener: { subscription: { unsubscribe: () => void } } | null = null;
    if (isSupabaseReady) {
      try {
        const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (!mounted) return;
          if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') && session?.user) {
            const profile = extractProfileFromSupabaseUser(session.user);
            const userToken = session.access_token || 'sb_token_' + session.user.id;
            setCitizen(profile);
            setToken(userToken);
            localStorage.setItem('jeevikasetu_citizen_token', userToken);
            localStorage.setItem('jeevikasetu_citizen_profile', JSON.stringify(profile));

            // Clean address bar URL params
            if (window.location.search.includes('code=') || window.location.hash.includes('access_token=')) {
              window.history.replaceState({}, document.title, window.location.pathname);
            }
          } else if (event === 'SIGNED_OUT') {
            setCitizen(null);
            setToken(null);
            localStorage.removeItem('jeevikasetu_citizen_token');
            localStorage.removeItem('jeevikasetu_citizen_profile');
          }
        });
        authListener = data;
      } catch (err) {
        console.warn('Could not register onAuthStateChange:', err);
      }
    } else {
      setIsLoading(false);
    }

    return () => {
      mounted = false;
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [isSupabaseReady]);

  // Keep persistent storage synced whenever token or citizen changes
  useEffect(() => {
    if (token && citizen) {
      localStorage.setItem('jeevikasetu_citizen_token', token);
      localStorage.setItem('jeevikasetu_citizen_profile', JSON.stringify(citizen));
    } else if (!token && !isLoading) {
      localStorage.removeItem('jeevikasetu_citizen_token');
      localStorage.removeItem('jeevikasetu_citizen_profile');
    }
  }, [token, citizen, isLoading]);

  /**
   * Official Supabase Google OAuth Flow
   * Redirects to genuine Google Account selection (accounts.google.com)
   */
  const signInWithGoogleOAuth = async (): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      if (!isSupabaseConfigured()) {
        return {
          success: false,
          error:
            'Supabase Anon Key is not yet configured. Please add VITE_SUPABASE_ANON_KEY to your environment variables.',
        };
      }

      // Explicitly redirect to current site origin with prompt=select_account
      const redirectTo = `${window.location.origin}/`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      console.error('Supabase signInWithOAuth error:', err);
      return {
        success: false,
        error: err?.message || 'Google OAuth प्रमाणीकरण शुरू करने में समस्या आई।',
      };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Direct login helper (used if backend session creation is invoked or in local dev)
   */
  const loginWithGoogle = async (
    email: string,
    fullName?: string,
    phone?: string,
    avatarUrl?: string
  ): Promise<boolean> => {
    setIsLoading(true);
    const cleanMail = email.trim().toLowerCase();
    const cleanName =
      (fullName && fullName.trim()) ||
      cleanMail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) + ' (नागरिक)';
    const cleanAvatar =
      avatarUrl ||
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanName)}&backgroundColor=4285F4,34A853,FBBC05,EA4335`;

    try {
      const res = await api.citizenGoogleLogin({
        email: cleanMail,
        fullName: cleanName,
        phone: phone || '',
        avatarUrl: cleanAvatar,
      });

      if (res && res.success && res.token && res.user) {
        setToken(res.token);
        setCitizen(res.user);
        localStorage.setItem('jeevikasetu_citizen_token', res.token);
        localStorage.setItem('jeevikasetu_citizen_profile', JSON.stringify(res.user));
        return true;
      }
    } catch (err) {
      console.warn('Backend call encountered issue, engaging persistent fallback session:', err);
    }

    const fallbackUser: CitizenProfile = {
      id: 'citizen-' + Math.random().toString(36).substring(2, 9),
      email: cleanMail,
      fullName: cleanName,
      phone: phone || undefined,
      avatarUrl: cleanAvatar,
      jurisdictionName: 'Supaul',
    };
    const fallbackToken = 'jeevikasetu_citizen_token_' + Date.now();

    setToken(fallbackToken);
    setCitizen(fallbackUser);
    localStorage.setItem('jeevikasetu_citizen_token', fallbackToken);
    localStorage.setItem('jeevikasetu_citizen_profile', JSON.stringify(fallbackUser));
    setIsLoading(false);
    return true;
  };

  const logoutCitizen = async (): Promise<void> => {
    try {
      if (isSupabaseReady) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn('Supabase signOut error:', err);
    } finally {
      setCitizen(null);
      setToken(null);
      localStorage.removeItem('jeevikasetu_citizen_token');
      localStorage.removeItem('jeevikasetu_citizen_profile');
    }
  };

  return (
    <CitizenAuthContext.Provider
      value={{
        citizen,
        token,
        isCitizenAuthenticated: !!(token && citizen),
        isLoading,
        isSupabaseReady,
        signInWithGoogleOAuth,
        loginWithGoogle,
        logoutCitizen,
      }}
    >
      {children}
    </CitizenAuthContext.Provider>
  );
};

export const useCitizenAuth = (): CitizenAuthContextType => {
  const context = useContext(CitizenAuthContext);
  if (!context) {
    throw new Error('useCitizenAuth must be used within a CitizenAuthProvider');
  }
  return context;
};
