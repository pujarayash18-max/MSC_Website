import { SystemRoleName } from '@/types';
export const ADMIN_ROLES: (SystemRoleName | string)[] = [
  'Super Admin',
  'SUPER_ADMIN',
  'Website Admin',
  'WEBSITE_ADMIN',
  'Event Manager',
  'EVENT_MANAGER',
  'Content Manager',
  'CONTENT_MANAGER',
  'Media Manager',
  'MEDIA_MANAGER',
  'Faculty Coordinator',
  'FACULTY_COORDINATOR',
  'President',
  'PRESIDENT',
  'Vice President',
  'VICE_PRESIDENT',
  'Technical Lead',
  'TECHNICAL_LEAD',
];
export const ALL_ROLES: (SystemRoleName | string)[] = [
  ...ADMIN_ROLES,
  'Student',
  'STUDENT',
  'Volunteer',
  'VOLUNTEER',
];
export function isAdminRole(role?: string | null): boolean {
  if (!role) return false;
  const normalized = role.trim().toUpperCase().replace(/[\s_-]+/g, '');
  return [
    'SUPERADMIN',
    'WEBSITEADMIN',
    'EVENTMANAGER',
    'CONTENTMANAGER',
    'MEDIAMANAGER',
    'FACULTYCOORDINATOR',
    'PRESIDENT',
    'VICEPRESIDENT',
    'TECHNICALLEAD',
  ].includes(normalized);
}