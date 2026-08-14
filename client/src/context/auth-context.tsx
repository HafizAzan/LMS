import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import api from '../lib/api';

export type User = {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'instructor';
  avatar?: string;
  enrolledCourses?: string[];
};

export type AuthPending = {
  email: string;
  expiresIn: number;
  message?: string;
};

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (payload: {
    name: string;
    email: string;
    password: string;
    role: 'student' | 'instructor';
  }) => Promise<AuthPending>;
  verifyEmail: (email: string, otp: string) => Promise<User>;
  resendOtp: (email: string, purpose?: 'verify' | 'reset') => Promise<AuthPending>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restore = async () => {
      try {
        const { data } = await api.get('/auth/me');
        setUser(data.user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    void restore();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login: async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        setUser(data.user);
        return data.user as User;
      },
      register: async (payload) => {
        const { data } = await api.post('/auth/register', payload);
        return data as AuthPending;
      },
      verifyEmail: async (email, otp) => {
        const { data } = await api.post('/auth/verify-email', { email, otp });
        setUser(data.user);
        return data.user as User;
      },
      resendOtp: async (email, purpose = 'verify') => {
        const { data } = await api.post('/auth/resend-otp', { email, purpose });
        return data as AuthPending;
      },
      logout: async () => {
        try {
          await api.post('/auth/logout');
        } catch {
          /* cookie may already be gone */
        }
        setUser(null);
      },
      updateUser: setUser,
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
