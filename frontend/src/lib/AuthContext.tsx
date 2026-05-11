'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import Cookies from 'js-cookie';
import api from './api';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'VIEWER' | 'BILLING_MANAGER';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from cookies on mount
  useEffect(() => {
    const savedToken = Cookies.get('cl_token');
    const savedUser = Cookies.get('cl_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post('/api/auth/login', { email, password });
    const { user, token } = res.data;
    Cookies.set('cl_token', token, { expires: 7 });
    Cookies.set('cl_user', JSON.stringify(user), { expires: 7 });
    setUser(user);
    setToken(token);
  };

  const register = async (email: string, password: string, name: string) => {
    const res = await api.post('/api/auth/register', { email, password, name });
    const { user, token } = res.data;
    Cookies.set('cl_token', token, { expires: 7 });
    Cookies.set('cl_user', JSON.stringify(user), { expires: 7 });
    setUser(user);
    setToken(token);
  };

  const logout = () => {
    Cookies.remove('cl_token');
    Cookies.remove('cl_user');
    setUser(null);
    setToken(null);
    window.location.href = '/auth/login';
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}