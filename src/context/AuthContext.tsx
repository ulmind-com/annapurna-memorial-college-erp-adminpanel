import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';

export type ActiveRole = 'SUPER_ADMIN' | 'TEACHER' | 'STUDENT';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  activeRole: ActiveRole;
  login: (email: string, pass: string) => Promise<void>;
  loginAsDemo: (role: ActiveRole) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isFaculty: boolean;
  isStudent: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = api.getToken();
      if (token && token !== 'null') {
        try {
          const profile = await api.getMe();
          setUser(profile);
        } catch {
          // Token invalid or expired
          api.setToken(null);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const res = await api.login(email, pass);
      setUser(res.user);
    } finally {
      setLoading(false);
    }
  };

  const loginAsDemo = async (role: ActiveRole) => {
    setLoading(true);
    try {
      let email = 'admin@annapurnacollege.org';
      let pass = 'Admin@123456';

      if (role === 'TEACHER') {
        email = 'teacher@annapurnacollege.org';
        pass = 'Teacher@123456';
      } else if (role === 'STUDENT') {
        email = 'student@annapurnacollege.org';
        pass = 'Student@123456';
      }

      const res = await api.login(email, pass);
      setUser(res.user);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    api.setToken(null);
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
        loginAsDemo,
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
