'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { User, SystemRoleName } from '@/types';
import { authService, RegisterPayload, LoginPayload } from '@/lib/services/authService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  role: SystemRoleName;
  login: (roleName?: SystemRoleName) => void;
  loginStudent: (payload: LoginPayload) => Promise<{ success: boolean; user?: User; message?: string }>;
  registerStudent: (payload: RegisterPayload) => Promise<{ success: boolean; user?: User; message?: string }>;
  logout: () => void;
  setMockUserRole: (role: SystemRoleName) => void;
}

const defaultUser: User = {
  id: 'usr_student_default',
  userId: 'usr_student_default',
  studentId: 'MCC-2026-00042',
  fullName: 'Rahul Sharma',
  email: 'rahul.sharma@marwadiuniversity.ac.in',
  enrollmentNumber: '92100103045',
  college: 'Marwadi University',
  department: 'Computer Engineering',
  year: '3rd Year',
  division: 'CE-A',
  profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  github: 'rahulsharma-dev',
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
  user: null,
  isLoading: true,
  isAuthenticated: false,
  role: 'Student',
  login: () => {},
  loginStudent: async () => ({ success: false }),
  registerStudent: async () => ({ success: false }),
  logout: () => {},
  setMockUserRole: () => {}
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let active = true;
    requestAnimationFrame(() => {
      if (!active) return;
      const sessionUser = authService.getSessionUser();
      if (sessionUser) {
        setUser(sessionUser);
      }
      setIsLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (user) return;

    let active = true;
    async function checkSwaAuth() {
      try {
        const res = await fetch('/.auth/me');
        const data = await res.json();
        if (data.clientPrincipal && active) {
          const principal = data.clientPrincipal;
          setUser((prev) => ({
            ...(prev || defaultUser),
            userId: principal.userId,
            fullName: principal.userDetails || 'Student User',
            email: principal.userDetails || 'student@marwadiuniversity.ac.in'
          }));
        }
      } catch {
        // Fallback
      } finally {
        if (active) setIsLoading(false);
      }
    }

    checkSwaAuth();
    return () => {
      active = false;
    };
  }, [user]);

  const login = (roleName: SystemRoleName = 'Student') => {
    const updatedUser = { ...defaultUser, roleName };
    setUser(updatedUser);
    authService.setSession(updatedUser);
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
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.href = '/.auth/logout';
      } else {
        router.replace('/login');
      }
    }
  };

  const setMockUserRole = (role: SystemRoleName) => {
    setUser((prev) => (prev ? { ...prev, roleName: role } : null));
  };

  const role: SystemRoleName = user?.roleName || 'Student';
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        role,
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
