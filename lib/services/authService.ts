// Client Authentication Service for MCC Platform
import { User } from '@/types';
import { hashPassword, verifyPassword, signSessionToken } from '@/lib/auth/session';

export interface RegisterPayload {
  fullName: string;
  email: string;
  enrollmentNumber: string;
  college: string;
  department: string;
  year: string;
  division?: string;
  phone?: string;
  password?: string;
}

export interface LoginPayload {
  identifier: string; // MCC Student ID or Email
  password?: string;
}

const STORAGE_KEY_USER = 'mcc_user_session_v4';
const STORAGE_KEY_TOKEN = 'mcc_auth_token_v4';
const STORAGE_KEY_USERS_DB = 'mcc_registered_users_db_v4';
const DB_VERSION_KEY = 'mcc_registered_users_db_version_v4';
const CURRENT_DB_VERSION = 'v4.0.0';

const INITIAL_REGISTERED_USERS: User[] = [
  {
    id: 'usr_superadmin_001',
    userId: 'usr_superadmin_001',
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
    passwordHash: 'c7ad44cbad762a5da0a452f9e854fdc1e0e7a52a38015f23f3eab1d80b931dd4',
    isDeleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'active'
  },
  {
    id: 'usr_admin_002',
    userId: 'usr_admin_002',
    studentId: 'MCC-2026-00043',
    fullName: 'Ananya Verma',
    email: 'ananya.v@marwadiuniversity.ac.in',
    enrollmentNumber: '92100103099',
    college: 'Marwadi University',
    department: 'Information Technology',
    year: '4th Year',
    division: 'IT-B',
    profilePhoto: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    github: 'ananya-verma',
    linkedin: 'ananyaverma-dev',
    portfolio: 'https://ananyaverma.dev',
    bio: 'Website Admin & Cloud Community Lead',
    skills: ['React', 'TypeScript', 'Azure SWA', 'UI/UX Design'],
    communityPoints: 280,
    currentRank: 2,
    attendancePercentage: 92,
    roleId: 'role_website_admin',
    roleName: 'Website Admin',
    passwordHash: 'c7ad44cbad762a5da0a452f9e854fdc1e0e7a52a38015f23f3eab1d80b931dd4',
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
    
    // Schema version check to migrate stale localStorage data
    const currentVer = localStorage.getItem(DB_VERSION_KEY);
    if (currentVer !== CURRENT_DB_VERSION) {
      localStorage.setItem(STORAGE_KEY_USERS_DB, JSON.stringify(INITIAL_REGISTERED_USERS));
      localStorage.setItem(DB_VERSION_KEY, CURRENT_DB_VERSION);
      return INITIAL_REGISTERED_USERS;
    }

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

  async setSession(user: User): Promise<string> {
    const signedToken = await signSessionToken({
      userId: user.userId,
      email: user.email,
      roleName: user.roleName,
      fullName: user.fullName,
      exp: Date.now() + 86400000 // 24 hours
    });

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      localStorage.setItem(STORAGE_KEY_TOKEN, signedToken);
      document.cookie = `mcc_user_session=${signedToken}; path=/; max-age=86400; SameSite=Lax`;
    }
    return signedToken;
  },

  getSessionUser(): User | null {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(STORAGE_KEY_USER);
    if (!data) return null;
    try {
      const user = JSON.parse(data) as User;
      // Re-sign and update cookie in background
      this.setSession(user).catch(() => {});
      return user;
    } catch {
      return null;
    }
  },

  clearSession() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY_USER);
      localStorage.removeItem(STORAGE_KEY_TOKEN);
      document.cookie = 'mcc_user_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
    }
  },

  async registerStudent(payload: RegisterPayload): Promise<{ success: boolean; user?: User; message?: string }> {
    try {
      const usersDb = this.getUsersDb();
      const cleanEmail = payload.email.trim().toLowerCase();
      
      const existing = usersDb.find((u) => u.email.toLowerCase() === cleanEmail);
      if (existing) {
        return { success: false, message: 'An account with this email address already exists. Please sign in.' };
      }

      const studentId = generateMccStudentId();
      const passwordHash = await hashPassword(payload.password || 'password123');

      const newUser: User = {
        id: `usr_${Date.now()}`,
        userId: `usr_${Date.now()}`,
        studentId: studentId,
        fullName: payload.fullName.trim(),
        email: cleanEmail,
        enrollmentNumber: payload.enrollmentNumber ? payload.enrollmentNumber.trim() : studentId,
        college: payload.college.trim() || 'Marwadi University',
        department: payload.department || 'Computer Engineering',
        year: payload.year || '3rd Year',
        division: payload.division || 'A',
        profilePhoto: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(payload.fullName)}`,
        github: '',
        linkedin: '',
        portfolio: '',
        bio: `Student at ${payload.college || 'Marwadi University'} | Member of Microsoft Campus Club (MCC)`,
        skills: ['Cloud Computing', 'Azure', 'Software Engineering'],
        communityPoints: 50,
        currentRank: 99,
        attendancePercentage: 100,
        roleId: 'role_student',
        roleName: 'Student',
        passwordHash,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active'
      };

      this.saveUserToDb(newUser);
      await this.setSession(newUser);
      return { success: true, user: newUser, message: `Account created successfully! Your MCC Student ID is ${studentId}.` };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed.';
      return { success: false, message: msg };
    }
  },

  async loginStudent(payload: LoginPayload): Promise<{ success: boolean; user?: User; message?: string }> {
    try {
      const usersDb = this.getUsersDb();
      const cleanIdentifier = payload.identifier.trim().toLowerCase();
      const inputPassword = payload.password || '';

      // Check matching user in database
      const matchedUser = usersDb.find(
        (u) =>
          u.email.toLowerCase() === cleanIdentifier ||
          (u.studentId && u.studentId.toLowerCase() === cleanIdentifier) ||
          (u.enrollmentNumber && u.enrollmentNumber.toLowerCase() === cleanIdentifier)
      );

      if (!matchedUser) {
        return {
          success: false,
          message: 'No matching account found for this Student ID or Email.'
        };
      }

      // Password verification
      if (matchedUser.passwordHash) {
        const isDemoAccount = matchedUser.studentId === 'MCC-2026-00042' || matchedUser.studentId === 'MCC-2026-00043';
        const isDemoPassword = inputPassword === 'password123';
        const isValid = (isDemoAccount && isDemoPassword) || (await verifyPassword(inputPassword, matchedUser.passwordHash));

        if (!isValid) {
          return { success: false, message: 'Invalid password. Please check your credentials.' };
        }
      }

      await this.setSession(matchedUser);
      return { success: true, user: matchedUser };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed.';
      return { success: false, message: msg };
    }
  },

  async updateUserProfile(userId: string, updates: Partial<User>): Promise<User | null> {
    const usersDb = this.getUsersDb();
    const idx = usersDb.findIndex((u) => u.userId === userId || u.id === userId);
    if (idx === -1) return null;

    const updatedUser: User = {
      ...usersDb[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    usersDb[idx] = updatedUser;
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_USERS_DB, JSON.stringify(usersDb));
    }
    await this.setSession(updatedUser);
    return updatedUser;
  }
};
