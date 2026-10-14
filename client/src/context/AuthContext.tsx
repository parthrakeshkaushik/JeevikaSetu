import React, { createContext, useContext, useState, useEffect } from 'react';

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: 'VOLUNTEER' | 'BDO' | 'DDC' | 'DPO' | 'ADM' | 'SDM' | 'DM' | 'SYSTEM_ADMIN';
  department?: string | null;
  jurisdictionType?: string | null;
  jurisdictionName?: string | null;
}

interface AuthContextType {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  quickLoginAsRole: (role: string) => Promise<boolean>;
  quickLoginUser: (targetUser: AdminUser) => Promise<boolean>;
  logout: () => void;
  demoUsers: AdminUser[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('jeevikasetu_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [demoUsers, setDemoUsers] = useState<AdminUser[]>([]);

  // Fetch demo users for the role switcher
  useEffect(() => {
    fetch('/api/auth/demo-users')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.users) {
          setDemoUsers(data.users);
        }
      })
      .catch((err) => console.warn('Could not load demo users:', err));
  }, []);

  // Check existing session
  useEffect(() => {
    const storedToken = localStorage.getItem('jeevikasetu_token');
    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${storedToken}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setUser(data.user);
          setToken(storedToken);
        } else {
          logout();
        }
      })
      .catch(() => logout())
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (email: string, password: string = 'password123'): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success && data.token && data.user) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('jeevikasetu_token', data.token);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Login failed:', e);
      return false;
    }
  };

  const quickLoginAsRole = async (targetRole: string, targetDistrict?: string): Promise<boolean> => {
    let target = demoUsers.find((u) => {
      if (targetDistrict && u.jurisdictionName !== targetDistrict) return false;
      return u.role === targetRole;
    });

    if (!target) {
      target = demoUsers.find((u) => u.role === targetRole);
    }

    if (target) {
      return login(target.email, 'password123');
    }

    return login('dm.state@jeevikasetu.gov.in', 'password123');
  };

  const quickLoginUser = async (targetUser: AdminUser): Promise<boolean> => {
    return login(targetUser.email, 'password123');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('jeevikasetu_token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        quickLoginAsRole,
        quickLoginUser,
        logout,
        demoUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
