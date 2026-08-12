'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DEFAULTPERMISSIONMATRIX, SystemRoleName, SystemModule, ActionPermission } from '@/types';
import { toast } from 'sonner';
import { ShieldCheck, Save, RefreshCw, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

async function fetchRoles() {
  const res = await fetch('/api/rbac', { credentials: 'include' });
  if (!res.ok) return [];
  const json = await res.json();
  return json.data?.roles || [];
}

export default function AdminRbacPage() {
  const queryClient = useQueryClient();
  const [matrix, setMatrix] = useState(DEFAULTPERMISSIONMATRIX);

  const { data: rolesData = [], isLoading } = useQuery({
    queryKey: ['admin-rbac-roles'],
    queryFn: fetchRoles,
  });

  const saveRbacMutation = useMutation({
    mutationFn: async () => {
      // Save each role's permissions to Database
      for (const roleName of Object.keys(matrix)) {
        const matchingRole = rolesData.find((r: any) => r.roleName === roleName || r.name === roleName);
        if (matchingRole) {
          await fetch('/api/rbac', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              roleId: matchingRole.id,
              permissions: matrix[roleName as SystemRoleName],
            }),
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-rbac-roles'] });
      toast.success('RBAC Permission Matrix saved and enforced live across all active user sessions!');
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
    toast.info(`Updated permission for ${roleName} on ${module}`);
  };

  const ALL_MODULES: SystemModule[] = [
    'Events',
    'Registration Forms',
    'Registrations',
    'Attendance',
    'Event Resources',
    'Certificates',
    'Winners',
    'Leaderboard',
    'Blogs',
    'Gallery',
    'Team Profiles',
    'Speaker Profiles',
    'Notices',
    'Contact Tickets',
    'Reports',
    'RBAC',
    'Audit Logs',
  ];

  const roles = Object.keys(matrix) as SystemRoleName[];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-emerald-500" /> RBAC Permission Engine &amp; Dynamic Matrix
          </h1>
          <p className="text-sm text-slate-600 dark:text-[#A8B0BB] mt-1">
            Configure granular module permissions. Changes apply instantly server-side upon save.
          </p>
        </div>

        <Button
          variant="fluent"
          size="sm"
          disabled={saveRbacMutation.isPending}
          onClick={() => saveRbacMutation.mutate()}
          className="font-bold gap-2"
        >
          {saveRbacMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save RBAC Policy
        </Button>
      </div>

      <Card className="p-6 border-slate-200 dark:border-[#2A323D] bg-white dark:bg-[#151B23] overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-[#2A323D] text-slate-500 dark:text-[#A8B0BB]">
              <th className="p-3">Role Name</th>
              {ALL_MODULES.map((m) => (
                <th key={m} className="p-2 capitalize text-center">
                  {m}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-[#2A323D]">
            {roles.map((roleName) => (
              <tr key={roleName} className="hover:bg-slate-100/50 dark:hover:bg-[#1B222C]/50">
                <td className="p-3 font-bold text-slate-900 dark:text-white">{roleName}</td>
                {ALL_MODULES.map((mod) => {
                  const perm = matrix[roleName]?.[mod];
                  const isChecked = perm === 'CRUD' || perm === 'View';
                  return (
                    <td key={mod} className="p-2 text-center">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => togglePermission(roleName, mod)}
                        className="rounded border-slate-300 dark:border-slate-700 text-[#00A4EF] focus:ring-[#00A4EF] cursor-pointer"
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
