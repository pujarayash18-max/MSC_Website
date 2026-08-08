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
const STORAGE_KEY_USERS_DB = 'mcc_registered_users_db';

// Default seed users database
const INITIAL_REGISTERED_USERS: User[] = [
  {
    id: 'usr_student_001',
    userId: 'usr_student_001',
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
  }
];

export function generateMccStudentId(seqNumber: number = Math.floor(10000 + Math.random() * 90000)): string {
  const currentYear = new Date().getFullYear();
  return `MCC-${currentYear}-${seqNumber.toString().padStart(5, '0')}`;
}

export const authService = {
  getUsersDb(): User[] {
    if (typeof window === 'undefined') return INITIAL_REGISTERED_USERS;
    const data = localStorage.getItem(STORAGE_KEY_USERS_DB);
    if (!data) {
      localStorage.setItem(STORAGE_KEY_USERS_DB, JSON.stringify(INITIAL_REGISTERED_USERS));
      return INITIAL_REGISTERED_USERS;
    }
    try {
      return JSON.parse(data) as User[];
    } catch {
      return INITIAL_REGISTERED_USERS;
    }
  },

  saveUserToDb(user: User) {
    const users = this.getUsersDb();
    const idx = users.findIndex((u) => u.email === user.email || u.studentId === user.studentId);
    let updated: User[];
    if (idx >= 0) {
      updated = [...users];
      updated[idx] = user;
    } else {
      updated = [user, ...users];
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_USERS_DB, JSON.stringify(updated));
    }
  },

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
        communityPoints: 50,
        currentRank: 99,
        attendancePercentage: 100,
        roleId: 'role_student',
        roleName: 'Student',
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active'
      };

      this.saveUserToDb(newUser);
      this.setSession(newUser);
      return { success: true, user: newUser, message: `Account created successfully! Your MCC Student ID is ${studentId}.` };
    } catch (err: any) {
      return { success: false, message: err.message || 'Registration failed.' };
    }
  },

  async loginStudent(payload: LoginPayload): Promise<{ success: boolean; user?: User; message?: string }> {
    try {
      const usersDb = this.getUsersDb();
      const cleanIdentifier = payload.identifier.trim().toLowerCase();

      // Check matching user in database
      const matchedUser = usersDb.find(
        (u) =>
          u.email.toLowerCase() === cleanIdentifier ||
          (u.studentId && u.studentId.toLowerCase() === cleanIdentifier) ||
          (u.enrollmentNumber && u.enrollmentNumber.toLowerCase() === cleanIdentifier)
      );

      if (matchedUser) {
        this.setSession(matchedUser);
        return { success: true, user: matchedUser };
      }

      // No match found -> Return failure so login page auto-redirects to register!
      return {
        success: false,
        message: 'No matching account found for this Student ID or Email.'
      };
    } catch (err: any) {
      return { success: false, message: err.message || 'Login failed.' };
    }
  }
};
