import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';

export type ActiveRole = 'SUPER_ADMIN' | 'TEACHER' | 'STUDENT';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  activeRole: ActiveRole;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isFaculty: boolean;
  isStudent: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getInitialStoredUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('annapurna_erp_token');
  const savedUser = localStorage.getItem('annapurna_current_user');
  if (token && token !== 'null' && !token.startsWith('mock_token_') && savedUser) {
    try {
      const parsed = JSON.parse(savedUser);
      if (parsed && (parsed.id || parsed.email)) return parsed;
    } catch {}
  }
  return null;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(getInitialStoredUser);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const token = api.getToken();
    if (token && token !== 'null') {
      // Non-blocking background sync with backend
      api.getMe()
        .then((profile) => {
          if (profile && profile.id) {
            setUser(profile);
            localStorage.setItem('annapurna_current_user', JSON.stringify(profile));
          }
        })
        .catch(() => {
          // 401 is handled by the API client (session_expired event); network errors keep the session
        });
    }
    const onExpired = () => setUser(null);
    window.addEventListener('annapurna_session_expired', onExpired);
    return () => window.removeEventListener('annapurna_session_expired', onExpired);
  }, []);

  const login = async (email: string, pass: string) => {
    // Authenticate and immediately set user without triggering full-screen blocking loader
    const res = await api.login(email, pass);
    setUser(res.user);
  };

  const logout = () => {
    api.setToken(null);
    localStorage.removeItem('annapurna_current_user');
    setUser(null);
  };

  // Derive active UI role from user role
  let activeRole: ActiveRole = 'SUPER_ADMIN';
  if (user) {
    if (user.role === 'FACULTY' || user.role === 'TEACHER') {
      activeRole = 'TEACHER';
    } else if (user.role === 'STUDENT') {
      activeRole = 'STUDENT';
    } else {
      activeRole = 'SUPER_ADMIN';
    }
  }

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isAdmin = isSuperAdmin || user?.role === 'ADMIN';
  const isFaculty = user?.role === 'FACULTY' || user?.role === 'TEACHER';
  const isStudent = user?.role === 'STUDENT';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        activeRole,
        login,
        logout,
        isAdmin,
        isSuperAdmin,
        isFaculty,
        isStudent,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
