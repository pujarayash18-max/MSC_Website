'use client';
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, SystemRoleName } from '@/types';
import { authService, RegisterPayload, LoginPayload } from '@/lib/services/authService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  role: SystemRoleName;
  login: (provider?: 'aad' | 'github') => void;
  loginStudent: (payload: LoginPayload) => Promise<{ success: boolean; user?: User; message?: string }>;
  registerStudent: (payload: RegisterPayload) => Promise<{ success: boolean; user?: User; message?: string }>;
  logout: () => void;
  setMockUserRole: (role: SystemRoleName) => void;
}

const defaultUser: User = {
  id: 'usr_dev_001',
  userId: 'usr_dev_001',
  studentId: 'MCC-2026-00001',
  fullName: 'Rahul Sharma',
  email: 'rahul.sharma@marwadiuniversity.ac.in',
  enrollmentNumber: '92100103045',
  college: 'Marwadi University',
  department: 'Computer Engineering',
  year: '3rd Year',
  division: 'CE-A',
  profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  github: 'rahulsharma-mu',
  linkedin: 'rahulsharma-dev',
  portfolio: 'https://rahulsharma.dev',
  bio: 'Passionate Cloud & Full-Stack Developer | Microsoft Student Ambassador',
  skills: ['TypeScript', 'Next.js', 'Azure Functions', 'Cosmos DB', 'Tailwind CSS'],
  communityPoints: 340,
  currentRank: 1,
  attendancePercentage: 95,
  roleId: 'role_superadmin',
  roleName: 'Super Admin',
  isDeleted: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  status: 'active'
};

const AuthContext = createContext<AuthContextType>({
  user: defaultUser,
  isLoading: false,
  isAuthenticated: true,
  role: 'Super Admin',
  login: () => {},
  loginStudent: async () => ({ success: false }),
  registerStudent: async () => ({ success: false }),
  logout: () => {},
  setMockUserRole: () => {}
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Check local session storage first
    const storedUser = authService.getSessionUser();
    if (storedUser) {
      setUser(storedUser);
      setIsLoading(false);
      return;
    }

    // 2. Check Azure SWA /.auth/me endpoint in production browser environment
    async function checkSwaAuth() {
      try {
        const res = await fetch('/.auth/me');
        const data = await res.json();
        if (data.clientPrincipal) {
          const principal = data.clientPrincipal;
          setUser((prev) => ({
            ...(prev || defaultUser),
            userId: principal.userId,
            fullName: principal.userDetails || 'Student User',
            email: principal.userDetails || 'student@marwadiuniversity.ac.in'
          }));
        }
      } catch {
        // Fallback to local default dev user
      } finally {
        setIsLoading(false);
      }
    }

    checkSwaAuth();
  }, []);

  const login = (provider: 'aad' | 'github' = 'aad') => {
    window.location.href = `/.auth/login/${provider}`;
  };

  const loginStudent = async (payload: LoginPayload) => {
    const res = await authService.loginStudent(payload);
    if (res.success && res.user) {
      setUser(res.user);
    }
    return res;
  };

  const registerStudent = async (payload: RegisterPayload) => {
    const res = await authService.registerStudent(payload);
    if (res.success && res.user) {
      setUser(res.user);
    }
    return res;
  };

  const logout = () => {
    authService.clearSession();
    setUser(null);
    if (typeof window !== 'undefined') {
      if (window.location.pathname.startsWith('/.auth')) {
        window.location.href = '/.auth/logout';
      } else {
        window.location.href = '/login';
      }
    }
  };

  const setMockUserRole = (role: SystemRoleName) => {
    setUser((prev) => (prev ? { ...prev, roleName: role } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        role: user?.roleName || 'Student',
        login,
        loginStudent,
        registerStudent,
        logout,
        setMockUserRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
