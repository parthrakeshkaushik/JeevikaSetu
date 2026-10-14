import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client.js';

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
  loginWithGoogle: (email: string, fullName?: string, phone?: string, avatarUrl?: string) => Promise<boolean>;
  logoutCitizen: () => void;
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

  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Keep persistent storage synced
  useEffect(() => {
    if (token && citizen) {
      localStorage.setItem('jeevikasetu_citizen_token', token);
      localStorage.setItem('jeevikasetu_citizen_profile', JSON.stringify(citizen));
    } else if (!token) {
      localStorage.removeItem('jeevikasetu_citizen_token');
      localStorage.removeItem('jeevikasetu_citizen_profile');
    }
  }, [token, citizen]);

  const loginWithGoogle = async (
    email: string,
    fullName?: string,
    phone?: string,
    avatarUrl?: string
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await api.citizenGoogleLogin({
        email: email.trim().toLowerCase(),
        fullName: fullName || email.split('@')[0],
        phone: phone || '9876543210',
        avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName || email)}&backgroundColor=1d4ed8,0f766e,ea580c`,
      });

      if (res.success && res.token && res.user) {
        setToken(res.token);
        setCitizen(res.user);
        localStorage.setItem('jeevikasetu_citizen_token', res.token);
        localStorage.setItem('jeevikasetu_citizen_profile', JSON.stringify(res.user));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Google citizen login failed:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logoutCitizen = () => {
    setCitizen(null);
    setToken(null);
    localStorage.removeItem('jeevikasetu_citizen_token');
    localStorage.removeItem('jeevikasetu_citizen_profile');
  };

  return (
    <CitizenAuthContext.Provider
      value={{
        citizen,
        token,
        isCitizenAuthenticated: !!(token && citizen),
        isLoading,
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
