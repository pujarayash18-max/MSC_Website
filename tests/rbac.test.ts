import { describe, it, expect } from 'vitest';
import { ADMIN_ROLES, ALL_ROLES, isAdminRole } from '@/lib/constants/roles';

describe('RBAC Roles & Matrix', () => {
  it('should include Super Admin, Website Admin, and Event Manager in ADMIN_ROLES', () => {
    expect(ADMIN_ROLES).toContain('Super Admin');
    expect(ADMIN_ROLES).toContain('Website Admin');
    expect(ADMIN_ROLES).toContain('Event Manager');
  });

  it('should not include Student or Volunteer in ADMIN_ROLES', () => {
    expect(ADMIN_ROLES).not.toContain('Student');
    expect(ADMIN_ROLES).not.toContain('Volunteer');
  });

  it('should correctly validate role strings with isAdminRole helper', () => {
    expect(isAdminRole('SUPER_ADMIN')).toBe(true);
    expect(isAdminRole('Super Admin')).toBe(true);
    expect(isAdminRole('STUDENT')).toBe(false);
    expect(isAdminRole('Student')).toBe(false);
  });

  it('should define all 11 system roles (22 total title & enum variants)', () => {
    expect(ALL_ROLES).toHaveLength(22);
  });
});
