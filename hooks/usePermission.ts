'use client';
import { useAuth } from './useAuth';
import { SystemModule, DEFAULTPERMISSIONMATRIX, ActionPermission } from '@/types';

export function usePermission(moduleName?: SystemModule) {
  const { role } = useAuth();

  const getPermission = (mod: SystemModule): ActionPermission => {
    const roleMap = DEFAULTPERMISSIONMATRIX[role];
    if (!roleMap) return 'No View';
    return roleMap[mod] || 'No View';
  };

  const hasPermission = (mod: SystemModule, required: 'CRUD' | 'View' = 'View'): boolean => {
    const perm = getPermission(mod);
    if (perm === 'No View') return false;
    if (required === 'View') return perm === 'View' || perm === 'CRUD';
    return perm === 'CRUD';
  };

  const currentPermission = moduleName ? getPermission(moduleName) : 'No View';
  const canManageCurrent = moduleName ? hasPermission(moduleName, 'CRUD') : false;
  const canViewCurrent = moduleName ? hasPermission(moduleName, 'View') : false;

  return {
    role,
    getPermission,
    hasPermission,
    currentPermission,
    canManageCurrent,
    canViewCurrent
  };
}
