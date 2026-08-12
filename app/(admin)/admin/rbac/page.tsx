'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DEFAULTPERMISSIONMATRIX,
  SystemRoleName,
  SystemModule,
  ActionPermission,
  normalizeRoleKey,
} from '@/types';
import { toast } from 'sonner';
import {
  ShieldCheck,
  Save,
  Loader2,
  Search,
  CheckCircle2,
  XCircle,
  Crown,
  Shield,
  Zap,
  Users,
  Award,
  Lock,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { usePermission } from '@/hooks/usePermission';

async function fetchRoles() {
  const res = await fetch('/api/rbac', { credentials: 'include' });
  if (!res.ok) return [];
  const json = await res.json();
  return json.data?.roles || [];
}

const UNIQUE_ROLES: SystemRoleName[] = [
  'Super Admin',
  'Website Admin',
  'Event Manager',
  'Content Manager',
  'Media Manager',
  'Faculty Coordinator',
  'President',
  'Vice President',
  'Technical Lead',
  'Student',
  'Volunteer',
];

const ALL_MODULES: SystemModule[] = [
  'Dashboard',
  'Events',
  'Registration Forms',
  'Registrations',
  'Attendance',
  'Event Resources',
  'Certificates',
  'Winners',
  'Leaderboard',
  'Team Profiles',
  'Speaker Profiles',
  'Gallery',
  'Blogs',
  'Notices',
  'Contact Tickets',
  'Reports',
  'Audit Logs',
  'RBAC',
  'Settings',
];

function getRoleIcon(role: SystemRoleName) {
  switch (role) {
    case 'Super Admin':
      return <Crown className="w-4 h-4 text-amber-500" />;
    case 'Website Admin':
      return <Shield className="w-4 h-4 text-sky-500" />;
    case 'President':
    case 'Vice President':
      return <Award className="w-4 h-4 text-purple-500" />;
    case 'Technical Lead':
    case 'Event Manager':
      return <Zap className="w-4 h-4 text-blue-500" />;
    case 'Faculty Coordinator':
      return <ShieldCheck className="w-4 h-4 text-emerald-500" />;
    default:
      return <Users className="w-4 h-4 text-slate-400" />;
  }
}

export default function AdminRbacPage() {
  const queryClient = useQueryClient();
  const { refreshUser } = useAuth();
  const { hasPermission } = usePermission('RBAC');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<'All' | 'Admin' | 'Student'>('All');

  // Matrix state with exact 11 unique roles
  const [matrix, setMatrix] = useState<Record<SystemRoleName, Record<SystemModule, ActionPermission>>>(
    () => {
      const initial = {} as Record<SystemRoleName, Record<SystemModule, ActionPermission>>;
      UNIQUE_ROLES.forEach((r) => {
        initial[r] = { ...(DEFAULTPERMISSIONMATRIX[r] || DEFAULTPERMISSIONMATRIX['Student']) };
      });
      return initial;
    }
  );

  const { data: dbRolesData = [], isLoading } = useQuery({
    queryKey: ['admin-rbac-roles'],
    queryFn: fetchRoles,
  });

  // Populate matrix with live DB permissions on load
  useEffect(() => {
    if (dbRolesData && dbRolesData.length > 0) {
      setMatrix((prev) => {
        const next = { ...prev };
        dbRolesData.forEach((r: any) => {
          const normKey = normalizeRoleKey(r.roleName || r.name);
          if (r.permissions && typeof r.permissions === 'object') {
            next[normKey] = { ...next[normKey], ...r.permissions };
          }
        });
        return next;
      });
    }
  }, [dbRolesData]);

  const saveRbacMutation = useMutation({
    mutationFn: async () => {
      for (const roleName of UNIQUE_ROLES) {
        const rolePermissions = matrix[roleName];

        const res = await fetch('/api/rbac', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            roleName,
            permissions: rolePermissions,
          }),
        });

        if (!res.ok) {
          const json = await res.json();
          throw new Error(json.error || `Failed to save ${roleName}`);
        }
      }
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['admin-rbac-roles'] });
      await refreshUser();
      toast.success('RBAC Permission Matrix saved live to database! All users and navigation menus updated.', {
        description: 'Role access policies have taken effect immediately.',
      });
    },
    onError: (e: Error) => {
      toast.error(e.message || 'Failed to save RBAC policy.');
    },
  });

  const togglePermission = (roleName: SystemRoleName, module: SystemModule) => {
    setMatrix((prev) => {
      const copy = { ...prev };
      const currentVal = copy[roleName]?.[module];
      const newVal: ActionPermission = currentVal === 'CRUD' ? 'No View' : 'CRUD';
      copy[roleName] = {
        ...copy[roleName],
        [module]: newVal,
      };
      return copy;
    });
  };

  const setRowAll = (roleName: SystemRoleName, action: 'CRUD' | 'No View') => {
    setMatrix((prev) => {
      const copy = { ...prev };
      const updatedRow = {} as Record<SystemModule, ActionPermission>;
      ALL_MODULES.forEach((m) => {
        updatedRow[m] = action;
      });
      copy[roleName] = updatedRow;
      return copy;
    });
    toast.info(`Updated all permissions for ${roleName} to ${action}`);
  };

  // Restrict access if current user doesn't have RBAC view permission
  if (!hasPermission('RBAC', 'View')) {
    return (
      <div className="p-8 max-w-xl mx-auto my-12 text-center space-y-4 bg-white dark:bg-[#151B23] border border-rose-500/30 rounded-2xl shadow-2xl">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Access Denied</h2>
        <p className="text-xs text-slate-600 dark:text-[#A8B0BB]">
          Your current role does not have permission to view or manage the RBAC Permission Engine.
        </p>
      </div>
    );
  }

  // Filter roles cleanly
  const filteredRoles = UNIQUE_ROLES.filter((role) => {
    const matchesSearch =
      role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ALL_MODULES.some((m) => m.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterCategory === 'Admin') {
      return role !== 'Student' && role !== 'Volunteer';
    }
    if (filterCategory === 'Student') {
      return role === 'Student' || role === 'Volunteer';
    }
    return true;
  });

  if (isLoading && dbRolesData.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#00A4EF]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-[#0078D4] dark:text-[#00A4EF]" /> RBAC Permission Engine
          </h1>
          <p className="text-sm text-slate-600 dark:text-[#A8B0BB] mt-1">
            Manage granular module access for 11 core roles. Changes are stored in database and enforced live across all users.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="fluent"
            size="sm"
            disabled={saveRbacMutation.isPending}
            onClick={() => saveRbacMutation.mutate()}
            className="font-bold gap-2 text-xs shadow-lg shadow-sky-500/20"
          >
            {saveRbacMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save RBAC Matrix
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-100/80 dark:bg-[#151B23] border border-slate-200 dark:border-[#2A323D]">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter by role or module name..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-[#0D1117] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#00A4EF] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          {(['All', 'Admin', 'Student'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                filterCategory === cat
                  ? 'bg-[#0078D4] dark:bg-[#00A4EF] text-white shadow-sm'
                  : 'bg-white dark:bg-[#0D1117] text-slate-700 dark:text-[#A8B0BB] border border-slate-200 dark:border-[#2A323D] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat} Roles
            </button>
          ))}
        </div>
      </div>

      {/* Permission Matrix Table */}
      <Card className="p-0 border-slate-200 dark:border-[#2A323D] bg-white dark:bg-[#151B23] shadow-xl overflow-hidden">
        <div className="overflow-x-auto max-h-[70vh]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-slate-100 dark:bg-[#0D1117] z-20 border-b border-slate-200 dark:border-[#2A323D] shadow-sm">
              <tr>
                <th className="p-4 font-bold text-slate-900 dark:text-white sticky left-0 bg-slate-100 dark:bg-[#0D1117] z-30 min-w-[220px] shadow-r">
                  Role Name ({filteredRoles.length})
                </th>
                <th className="p-3 text-center min-w-[90px] font-bold text-slate-600 dark:text-slate-400">
                  Quick Actions
                </th>
                {ALL_MODULES.map((m) => (
                  <th
                    key={m}
                    className="p-3 font-semibold text-slate-700 dark:text-[#A8B0BB] text-center min-w-[110px] whitespace-nowrap"
                  >
                    {m}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-[#2A323D]">
              {filteredRoles.map((roleName) => {
                const roleRow = matrix[roleName] || {};
                const activeCount = ALL_MODULES.filter(
                  (m) => roleRow[m] === 'CRUD' || roleRow[m] === 'View'
                ).length;

                return (
                  <tr
                    key={roleName}
                    className="hover:bg-slate-50 dark:hover:bg-[#1B222C]/60 transition-colors group"
                  >
                    {/* Sticky Role Name Column */}
                    <td className="p-4 font-bold text-slate-900 dark:text-white sticky left-0 bg-white dark:bg-[#151B23] group-hover:bg-slate-50 dark:group-hover:bg-[#1B222C] z-10 border-r border-slate-200 dark:border-[#2A323D]">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-slate-100 dark:bg-[#0D1117] border border-slate-200 dark:border-[#2A323D]">
                          {getRoleIcon(roleName)}
                        </div>
                        <div>
                          <div className="text-xs font-extrabold">{roleName}</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                            <Badge
                              variant={activeCount > 10 ? 'primary' : 'outline'}
                              className="text-[9px] px-1.5 py-0"
                            >
                              {activeCount} / {ALL_MODULES.length} Access
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Quick Action Toggle Buttons */}
                    <td className="p-2 text-center border-r border-slate-200 dark:border-[#2A323D]">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          title="Grant All Modules"
                          onClick={() => setRowAll(roleName, 'CRUD')}
                          className="p-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          title="Revoke All Modules"
                          onClick={() => setRowAll(roleName, 'No View')}
                          className="p-1 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* Module Checkbox Matrix Cells */}
                    {ALL_MODULES.map((mod) => {
                      const perm = roleRow[mod];
                      const isGranted = perm === 'CRUD' || perm === 'View';

                      return (
                        <td key={mod} className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => togglePermission(roleName, mod)}
                            className={`w-7 h-7 mx-auto rounded-xl flex items-center justify-center transition-all ${
                              isGranted
                                ? 'bg-[#0078D4] dark:bg-[#00A4EF] text-white shadow-md shadow-sky-500/30 scale-105'
                                : 'bg-slate-100 dark:bg-[#0D1117] border border-slate-200 dark:border-[#2A323D] text-slate-300 dark:text-slate-700 hover:border-slate-400 dark:hover:border-slate-500'
                            }`}
                          >
                            {isGranted ? (
                              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                            ) : (
                              <Lock className="w-3 h-3 opacity-40" />
                            )}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
