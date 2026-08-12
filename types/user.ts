// User, Role, Permission & Audit Log Models (§85, §89, §90, §108, §126)
import { BaseEntity } from './common';

export type SystemRoleName = 
  | 'Super Admin'
  | 'Website Admin'
  | 'Event Manager'
  | 'Content Manager'
  | 'Media Manager'
  | 'Faculty Coordinator'
  | 'President'
  | 'Vice President'
  | 'Technical Lead'
  | 'Student'
  | 'Volunteer';

export type SystemModule = 
  | 'Dashboard'
  | 'Events'
  | 'Registration Forms'
  | 'Registrations'
  | 'Attendance'
  | 'Event Resources'
  | 'Certificates'
  | 'Winners'
  | 'Leaderboard'
  | 'Team Profiles'
  | 'Speaker Profiles'
  | 'Gallery'
  | 'Blogs'
  | 'Notices'
  | 'Contact Tickets'
  | 'Reports'
  | 'Audit Logs'
  | 'RBAC'
  | 'Settings';

export type ActionPermission = 'CRUD' | 'View' | 'No View';

export interface Permission {
  module: SystemModule;
  access: ActionPermission; // 'CRUD', 'View', or 'No View'
  canCreate?: boolean;
  canRead?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
  canPublish?: boolean;
  canExport?: boolean;
}

export interface Role extends BaseEntity {
  roleId: string;
  roleName: SystemRoleName;
  description: string;
  permissions: Permission[];
}

export interface User extends BaseEntity {
  userId: string;
  studentId?: string;
  fullName: string;
  email: string;
  enrollmentNumber?: string;
  college: string;
  department: string;
  year: string;
  division?: string;
  profilePhoto?: string;
  github?: string;
  linkedin?: string;
  portfolio?: string;
  bio?: string;
  skills: string[];
  communityPoints: number;
  currentRank: number;
  attendancePercentage: number;
  roleId: string;
  roleName: SystemRoleName;
  passwordHash?: string;
}

export interface StudentProfile {
  userId: string;
  studentId: string;
  fullName: string;
  enrollmentNumber: string;
  department: string;
  year: string;
  division?: string;
}

export interface AuditLog {
  logId: string;
  userId: string;
  userName: string;
  role: string;
  action: string;
  module: SystemModule;
  details?: string;
  ipAddress?: string;
  browser?: string;
  status: 'success' | 'failure' | 'warning';
  timestamp: string;
}

// Complete §126 RBAC Permission Matrix Pre-encoded
export const DEFAULTPERMISSIONMATRIX: Record<SystemRoleName, Record<SystemModule, ActionPermission>> = {
  'Super Admin': {
    'Dashboard': 'CRUD',
    'Events': 'CRUD',
    'Registration Forms': 'CRUD',
    'Registrations': 'CRUD',
    'Attendance': 'CRUD',
    'Event Resources': 'CRUD',
    'Certificates': 'CRUD',
    'Winners': 'CRUD',
    'Leaderboard': 'CRUD',
    'Team Profiles': 'CRUD',
    'Speaker Profiles': 'CRUD',
    'Gallery': 'CRUD',
    'Blogs': 'CRUD',
    'Notices': 'CRUD',
    'Contact Tickets': 'CRUD',
    'Reports': 'CRUD',
    'Audit Logs': 'CRUD',
    'RBAC': 'CRUD',
    'Settings': 'CRUD'
  },
  'Website Admin': {
    'Dashboard': 'CRUD',
    'Events': 'CRUD',
    'Registration Forms': 'CRUD',
    'Registrations': 'CRUD',
    'Attendance': 'CRUD',
    'Event Resources': 'CRUD',
    'Certificates': 'CRUD',
    'Winners': 'CRUD',
    'Leaderboard': 'CRUD',
    'Team Profiles': 'CRUD',
    'Speaker Profiles': 'CRUD',
    'Gallery': 'CRUD',
    'Blogs': 'CRUD',
    'Notices': 'CRUD',
    'Contact Tickets': 'CRUD',
    'Reports': 'CRUD',
    'Audit Logs': 'View',
    'RBAC': 'No View',
    'Settings': 'No View'
  },
  'Event Manager': {
    'Dashboard': 'CRUD',
    'Events': 'CRUD',
    'Registration Forms': 'CRUD',
    'Registrations': 'CRUD',
    'Attendance': 'CRUD',
    'Event Resources': 'CRUD',
    'Certificates': 'CRUD',
    'Winners': 'CRUD',
    'Leaderboard': 'View',
    'Team Profiles': 'View',
    'Speaker Profiles': 'CRUD',
    'Gallery': 'CRUD',
    'Blogs': 'No View',
    'Notices': 'CRUD',
    'Contact Tickets': 'View',
    'Reports': 'View',
    'Audit Logs': 'No View',
    'RBAC': 'No View',
    'Settings': 'No View'
  },
  'Content Manager': {
    'Dashboard': 'View',
    'Events': 'View',
    'Registration Forms': 'View',
    'Registrations': 'No View',
    'Attendance': 'No View',
    'Event Resources': 'View',
    'Certificates': 'No View',
    'Winners': 'View',
    'Leaderboard': 'View',
    'Team Profiles': 'CRUD',
    'Speaker Profiles': 'CRUD',
    'Gallery': 'View',
    'Blogs': 'CRUD',
    'Notices': 'CRUD',
    'Contact Tickets': 'View',
    'Reports': 'View',
    'Audit Logs': 'No View',
    'RBAC': 'No View',
    'Settings': 'No View'
  },
  'Media Manager': {
    'Dashboard': 'View',
    'Events': 'View',
    'Registration Forms': 'No View',
    'Registrations': 'No View',
    'Attendance': 'No View',
    'Event Resources': 'View',
    'Certificates': 'No View',
    'Winners': 'View',
    'Leaderboard': 'View',
    'Team Profiles': 'View',
    'Speaker Profiles': 'View',
    'Gallery': 'CRUD',
    'Blogs': 'No View',
    'Notices': 'No View',
    'Contact Tickets': 'No View',
    'Reports': 'View',
    'Audit Logs': 'No View',
    'RBAC': 'No View',
    'Settings': 'No View'
  },
  'Faculty Coordinator': {
    'Dashboard': 'View',
    'Events': 'View',
    'Registration Forms': 'View',
    'Registrations': 'View',
    'Attendance': 'View',
    'Event Resources': 'View',
    'Certificates': 'View',
    'Winners': 'View',
    'Leaderboard': 'View',
    'Team Profiles': 'View',
    'Speaker Profiles': 'View',
    'Gallery': 'View',
    'Blogs': 'View',
    'Notices': 'View',
    'Contact Tickets': 'View',
    'Reports': 'View',
    'Audit Logs': 'View',
    'RBAC': 'No View',
    'Settings': 'No View'
  },
  'President': {
    'Dashboard': 'CRUD',
    'Events': 'CRUD',
    'Registration Forms': 'CRUD',
    'Registrations': 'CRUD',
    'Attendance': 'CRUD',
    'Event Resources': 'CRUD',
    'Certificates': 'CRUD',
    'Winners': 'CRUD',
    'Leaderboard': 'CRUD',
    'Team Profiles': 'CRUD',
    'Speaker Profiles': 'CRUD',
    'Gallery': 'CRUD',
    'Blogs': 'CRUD',
    'Notices': 'CRUD',
    'Contact Tickets': 'CRUD',
    'Reports': 'CRUD',
    'Audit Logs': 'View',
    'RBAC': 'No View',
    'Settings': 'No View'
  },
  'Vice President': {
    'Dashboard': 'CRUD',
    'Events': 'CRUD',
    'Registration Forms': 'CRUD',
    'Registrations': 'CRUD',
    'Attendance': 'CRUD',
    'Event Resources': 'CRUD',
    'Certificates': 'CRUD',
    'Winners': 'CRUD',
    'Leaderboard': 'CRUD',
    'Team Profiles': 'CRUD',
    'Speaker Profiles': 'CRUD',
    'Gallery': 'CRUD',
    'Blogs': 'CRUD',
    'Notices': 'CRUD',
    'Contact Tickets': 'CRUD',
    'Reports': 'CRUD',
    'Audit Logs': 'View',
    'RBAC': 'No View',
    'Settings': 'No View'
  },
  'Technical Lead': {
    'Dashboard': 'CRUD',
    'Events': 'CRUD',
    'Registration Forms': 'CRUD',
    'Registrations': 'CRUD',
    'Attendance': 'CRUD',
    'Event Resources': 'CRUD',
    'Certificates': 'CRUD',
    'Winners': 'CRUD',
    'Leaderboard': 'CRUD',
    'Team Profiles': 'CRUD',
    'Speaker Profiles': 'CRUD',
    'Gallery': 'CRUD',
    'Blogs': 'CRUD',
    'Notices': 'CRUD',
    'Contact Tickets': 'CRUD',
    'Reports': 'CRUD',
    'Audit Logs': 'View',
    'RBAC': 'No View',
    'Settings': 'No View'
  },
  'Student': {
    'Dashboard': 'View',
    'Events': 'View',
    'Registration Forms': 'View',
    'Registrations': 'View',
    'Attendance': 'View',
    'Event Resources': 'View',
    'Certificates': 'View',
    'Winners': 'View',
    'Leaderboard': 'View',
    'Team Profiles': 'View',
    'Speaker Profiles': 'View',
    'Gallery': 'View',
    'Blogs': 'View',
    'Notices': 'View',
    'Contact Tickets': 'View',
    'Reports': 'No View',
    'Audit Logs': 'No View',
    'RBAC': 'No View',
    'Settings': 'No View'
  },
  'Volunteer': {
    'Dashboard': 'View',
    'Events': 'View',
    'Registration Forms': 'View',
    'Registrations': 'View',
    'Attendance': 'CRUD',
    'Event Resources': 'View',
    'Certificates': 'View',
    'Winners': 'View',
    'Leaderboard': 'View',
    'Team Profiles': 'View',
    'Speaker Profiles': 'View',
    'Gallery': 'View',
    'Blogs': 'View',
    'Notices': 'View',
    'Contact Tickets': 'View',
    'Reports': 'No View',
    'Audit Logs': 'No View',
    'RBAC': 'No View',
    'Settings': 'No View'
  }
};

// Aliases for uppercase Prisma enum values to ensure zero permission lookup mismatches
(DEFAULTPERMISSIONMATRIX as Record<string, Record<SystemModule, ActionPermission>>)['SUPER_ADMIN'] = DEFAULTPERMISSIONMATRIX['Super Admin'];
(DEFAULTPERMISSIONMATRIX as Record<string, Record<SystemModule, ActionPermission>>)['WEBSITE_ADMIN'] = DEFAULTPERMISSIONMATRIX['Website Admin'];
(DEFAULTPERMISSIONMATRIX as Record<string, Record<SystemModule, ActionPermission>>)['EVENT_MANAGER'] = DEFAULTPERMISSIONMATRIX['Event Manager'];
(DEFAULTPERMISSIONMATRIX as Record<string, Record<SystemModule, ActionPermission>>)['CONTENT_MANAGER'] = DEFAULTPERMISSIONMATRIX['Content Manager'];
(DEFAULTPERMISSIONMATRIX as Record<string, Record<SystemModule, ActionPermission>>)['MEDIA_MANAGER'] = DEFAULTPERMISSIONMATRIX['Media Manager'];
(DEFAULTPERMISSIONMATRIX as Record<string, Record<SystemModule, ActionPermission>>)['FACULTY_COORDINATOR'] = DEFAULTPERMISSIONMATRIX['Faculty Coordinator'];
(DEFAULTPERMISSIONMATRIX as Record<string, Record<SystemModule, ActionPermission>>)['PRESIDENT'] = DEFAULTPERMISSIONMATRIX['President'];
(DEFAULTPERMISSIONMATRIX as Record<string, Record<SystemModule, ActionPermission>>)['VICE_PRESIDENT'] = DEFAULTPERMISSIONMATRIX['Vice President'];
(DEFAULTPERMISSIONMATRIX as Record<string, Record<SystemModule, ActionPermission>>)['TECHNICAL_LEAD'] = DEFAULTPERMISSIONMATRIX['Technical Lead'];
(DEFAULTPERMISSIONMATRIX as Record<string, Record<SystemModule, ActionPermission>>)['STUDENT'] = DEFAULTPERMISSIONMATRIX['Student'];
(DEFAULTPERMISSIONMATRIX as Record<string, Record<SystemModule, ActionPermission>>)['VOLUNTEER'] = DEFAULTPERMISSIONMATRIX['Volunteer'];

export function getRolePermissions(roleName?: string | null): Record<SystemModule, ActionPermission> {
  if (!roleName) return DEFAULTPERMISSIONMATRIX['Student'];
  return (DEFAULTPERMISSIONMATRIX as Record<string, Record<SystemModule, ActionPermission>>)[roleName] || DEFAULTPERMISSIONMATRIX['Super Admin'];
}
