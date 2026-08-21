'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api, setAuthToken, clearAuthToken, getAuthToken } from './api';

export type UserProfile = {
  id: string;
  email: string;
  full_name: string | null;
  headline?: string | null;
  bio?: string | null;
  location?: string | null;
  avatar_url?: string | null;
  github_username?: string | null;
  education_year: string | null;
  target_role: string | null;
  experience_level: string | null;
  interests: string | null;
  profile_public: boolean;
  onboarding_completed: boolean;
  skills: { id: string; name: string; slug: string }[];
};

type AuthContextType = {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  refetchUser: () => Promise<UserProfile | null>;
  logout: () => Promise<void>;
  saveAuthToken: (token: string) => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  refetchUser: async () => null,
  logout: async () => {},
  saveAuthToken: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetchUser = useCallback(async (): Promise<UserProfile | null> => {
    try {
      setError(null);
      const data: UserProfile = await api('/me');
      setUser(data);
      return data;
    } catch (err: any) {
      setUser(null);
      if (getAuthToken()) {
        clearAuthToken();
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetchUser();
  }, [refetchUser]);

  const saveAuthToken = (token: string) => {
    setAuthToken(token);
    refetchUser();
  };

  const logout = async () => {
    try {
      await api('/auth/logout', { method: 'POST' });
    } catch (_) {
      // Ignore logout errors
    } finally {
      clearAuthToken();
      setUser(null);
      window.location.href = '/auth';
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, refetchUser, logout, saveAuthToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
