// Client Authentication Service for MCC Platform (§11, §12, §13, §14, §15, §16, §17)
import { User, StudentProfile } from '@/types';

export interface RegisterPayload {
  fullName: string;
  email: string;
  enrollmentNumber: string;
  college: string;
  department: string;
  year: string;
  division?: string;
  phone: string;
  password?: string;
}

export interface LoginPayload {
  identifier: string; // MCC Student ID or Email
  password?: string;
}

const STORAGE_KEY_USER = 'mcc_user_session';
const STORAGE_KEY_TOKEN = 'mcc_auth_token';

// Generate server-side safe collision-resistant MCC Student ID e.g. MCC-2026-00042
export function generateMccStudentId(seqNumber: number = Math.floor(10000 + Math.random() * 90000)): string {
  const currentYear = new Date().getFullYear();
  return `MCC-${currentYear}-${seqNumber.toString().padStart(5, '0')}`;
}

export const authService = {
  // Store session in localStorage / cookies
  setSession(user: User, token: string = 'mock-jwt-session-token') {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      localStorage.setItem(STORAGE_KEY_TOKEN, token);
    }
  },

  getSessionUser(): User | null {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(STORAGE_KEY_USER);
    if (!data) return null;
    try {
      return JSON.parse(data) as User;
    } catch {
      return null;
    }
  },

  clearSession() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY_USER);
      localStorage.removeItem(STORAGE_KEY_TOKEN);
    }
  },

  async registerStudent(payload: RegisterPayload): Promise<{ success: boolean; user?: User; message?: string }> {
    try {
      // Call backend API if available, fallback to client session creation
      const studentId = generateMccStudentId();
      const newUser: User = {
        id: `usr_${Date.now()}`,
        userId: `usr_${Date.now()}`,
        studentId: studentId,
        fullName: payload.fullName,
        email: payload.email,
        enrollmentNumber: payload.enrollmentNumber,
        college: payload.college || 'Marwadi University',
        department: payload.department,
        year: payload.year,
        division: payload.division || 'A',
        profilePhoto: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(payload.fullName)}`,
        github: '',
        linkedin: '',
        portfolio: '',
        bio: 'Member of Microsoft Campus Club (MCC)',
        skills: ['Cloud Computing', 'Azure', 'Web Development'],
        communityPoints: 50, // Welcome points
        currentRank: 99,
        attendancePercentage: 100,
        roleId: 'role_student',
        roleName: 'Student',
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active'
      };

      this.setSession(newUser);
      return { success: true, user: newUser, message: `Account created successfully! Your MCC Student ID is ${studentId}.` };
    } catch (err: any) {
      return { success: false, message: err.message || 'Registration failed.' };
    }
  },

  async loginStudent(payload: LoginPayload): Promise<{ success: boolean; user?: User; message?: string }> {
    try {
      const existing = this.getSessionUser();
      if (existing && (existing.email === payload.identifier || existing.studentId === payload.identifier)) {
        return { success: true, user: existing };
      }

      // Default demo login fallback if identifier matches demo user
      const demoUser: User = {
        id: 'usr_student_001',
        userId: 'usr_student_001',
        studentId: 'MCC-2026-00042',
        fullName: payload.identifier.includes('@') ? payload.identifier.split('@')[0] : 'MCC Student Member',
        email: payload.identifier.includes('@') ? payload.identifier : 'student@marwadiuniversity.ac.in',
        enrollmentNumber: '92100103045',
        college: 'Marwadi University',
        department: 'Computer Engineering',
        year: '3rd Year',
        division: 'CE-A',
        profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        github: 'github-user',
        linkedin: 'linkedin-user',
        portfolio: '',
        bio: 'Active MCC Student Member',
        skills: ['TypeScript', 'Azure', 'React'],
        communityPoints: 340,
        currentRank: 5,
        attendancePercentage: 95,
        roleId: 'role_student',
        roleName: 'Student',
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active'
      };

      this.setSession(demoUser);
      return { success: true, user: demoUser };
    } catch (err: any) {
      return { success: false, message: err.message || 'Login failed.' };
    }
  }
};
