'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { User, SystemRoleName } from '@/types';

export interface RegisterPayload {
  fullName: string;
  email: string;
  enrollmentNumber: string;
  college: string;
  department: string;
  year: string;
  division?: string;
  password: string;
}

export interface LoginPayload {
  identifier: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  role: SystemRoleName;
  loginStudent: (payload: LoginPayload) => Promise<{ success: boolean; user?: User; message?: string }>;
  registerStudent: (payload: RegisterPayload) => Promise<{ success: boolean; user?: User; message?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  role: 'Student',
  loginStudent: async () => ({ success: false }),
  registerStudent: async () => ({ success: false }),
  logout: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load session from server on mount (reads HttpOnly cookie server-side)
  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data?.user) {
          setUser(json.data.user as User);
          return;
        }
      }
      setUser(null);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isSubscribed = true;
    fetch('/api/auth/me', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!isSubscribed) return;
        if (json?.success && json?.data?.user) {
          setUser(json.data.user as User);
        } else {
          setUser(null);
        }
      })
      .catch(() => {
        if (isSubscribed) setUser(null);
      })
      .finally(() => {
        if (isSubscribed) setIsLoading(false);
      });
    return () => {
      isSubscribed = false;
    };
  }, []);

  const loginStudent = async (
    payload: LoginPayload
  ): Promise<{ success: boolean; user?: User; message?: string }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (res.ok && json.success && json.data?.user) {
        setUser(json.data.user as User);
        return { success: true, user: json.data.user as User };
      }
      return { success: false, message: json.error || 'Login failed.' };
    } catch {
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const registerStudent = async (
    payload: RegisterPayload
  ): Promise<{ success: boolean; user?: User; message?: string }> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if ((res.status === 200 || res.status === 201) && json.success && json.data?.user) {
        setUser(json.data.user as User);
        return {
          success: true,
          user: json.data.user as User,
          message: json.data.message,
        };
      }
      return { success: false, message: json.error || 'Registration failed.' };
    } catch {
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch {
      // Proceed with local cleanup even if the request fails
    }
    setUser(null);
    router.push('/login');
  };

  const role: SystemRoleName = (user?.roleName as SystemRoleName) || 'Student';
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        role,
        loginStudent,
        registerStudent,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
