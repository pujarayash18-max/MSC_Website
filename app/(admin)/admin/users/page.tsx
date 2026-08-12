'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Users as UsersIcon,
  ShieldCheck,
  Search,
  RefreshCw,
  Loader2,
  Crown,
  Shield,
  Zap,
  Award,
  UserCheck,
  CheckCircle2,
  Sliders,
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface RegisteredUser {
  id: string;
  studentId: string;
  fullName: string;
  email: string;
  enrollmentNumber?: string | null;
  college: string;
  department: string;
  year: string;
  division?: string | null;
  profilePhoto?: string | null;
  communityPoints: number;
  currentRank: number;
  roleName: string;
  roleId: string;
  status: string;
  createdAt: string;
}

const AVAILABLE_ROLES = [
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

function formatRoleDisplayName(role?: string | null): string {
  if (!role) return 'Student';
  const clean = role.replace(/_/g, ' ').toLowerCase();
  return clean.replace(/\b\w/g, (c) => c.toUpperCase());
}

function getRoleBadgeVariant(role?: string | null): 'primary' | 'warning' | 'purple' | 'danger' | 'outline' {
  if (!role) return 'outline';
  const norm = role.toUpperCase();
  if (norm.includes('SUPER') || norm.includes('PRESIDENT')) return 'warning';
  if (norm.includes('ADMIN') || norm.includes('LEAD')) return 'primary';
  if (norm.includes('MANAGER') || norm.includes('COORDINATOR')) return 'purple';
  if (norm.includes('VOLUNTEER')) return 'danger';
  return 'outline';
}

async function fetchRegisteredUsers() {
  const res = await fetch('/api/users', {
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
    },
  });
  if (!res.ok) return [];
  const json = await res.json();
  return json.data?.users || [];
}

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const { data: users = [], isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['admin-registered-users'],
    queryFn: fetchRegisteredUsers,
    refetchInterval: 10000,
  });

  const handleRoleChange = async (userId: string, newRoleName: string, userName: string) => {
    setUpdatingUserId(userId);
    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, roleName: newRoleName }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        toast.success(
          `Designation for ${userName} updated to "${formatRoleDisplayName(newRoleName)}"`,
          { description: 'Permissions and access rights updated live in database.' }
        );
        queryClient.invalidateQueries({ queryKey: ['admin-registered-users'] });
      } else {
        toast.error('Failed to assign role access', { description: json.error });
      }
    } catch {
      toast.error('Network error assigning designation');
    } finally {
      setUpdatingUserId(null);
    }
  };

  // Filter users by search term & role category safely
  const filteredUsers = users.filter((u: RegisteredUser) => {
    const nameStr = u.fullName || '';
    const emailStr = u.email || '';
    const studentIdStr = u.studentId || '';
    const deptStr = u.department || '';

    const matchesSearch =
      nameStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emailStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      studentIdStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deptStr.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    const rName = (u.roleName || 'STUDENT').toUpperCase();
    if (roleFilter === 'Admin') {
      return rName !== 'STUDENT' && rName !== 'VOLUNTEER';
    }
    if (roleFilter === 'Student') {
      return rName === 'STUDENT' || rName === 'VOLUNTEER';
    }
    return true;
  });

  const totalUsers = users.length;
  const adminRoleCount = users.filter((u: RegisteredUser) => {
    const rName = (u.roleName || 'STUDENT').toUpperCase();
    return rName !== 'STUDENT' && rName !== 'VOLUNTEER';
  }).length;
  const studentRoleCount = totalUsers - adminRoleCount;

  if (isLoading && users.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#0078D4] dark:text-[#00A4EF]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <UsersIcon className="w-7 h-7 text-[#0078D4] dark:text-[#00A4EF]" /> User Designation &amp; Access Engine
          </h1>
          <p className="text-sm text-slate-600 dark:text-[#A8B0BB] mt-1">
            View all registered users and assign executive designations and console access rights in real-time.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isRefetching}
          className="text-xs gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin' : ''}`} /> Refresh Users
        </Button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-4 border-slate-200 dark:border-[#2A323D] bg-white dark:bg-[#151B23]">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center font-bold">
            <UsersIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{totalUsers}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Total Registered Members</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4 border-slate-200 dark:border-[#2A323D] bg-white dark:bg-[#151B23]">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
            <Crown className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{adminRoleCount}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Executive &amp; Admin Roles</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4 border-slate-200 dark:border-[#2A323D] bg-white dark:bg-[#151B23]">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{studentRoleCount}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Student &amp; Volunteer Members</p>
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-100/80 dark:bg-[#151B23] border border-slate-200 dark:border-[#2A323D]">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, student ID..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-[#0D1117] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#00A4EF] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          {(['All', 'Admin', 'Student'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setRoleFilter(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                roleFilter === cat
                  ? 'bg-[#0078D4] dark:bg-[#00A4EF] text-white shadow-sm'
                  : 'bg-white dark:bg-[#0D1117] text-slate-700 dark:text-[#A8B0BB] border border-slate-200 dark:border-[#2A323D] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat} Users
            </button>
          ))}
        </div>
      </div>

      {/* Registered Users Table */}
      <Card className="p-0 border-slate-200 dark:border-[#2A323D] bg-white dark:bg-[#151B23] shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 dark:bg-[#0D1117] border-b border-slate-200 dark:border-[#2A323D]">
              <tr>
                <th className="p-4 font-bold text-slate-900 dark:text-white">Registered Member</th>
                <th className="p-4 font-bold text-slate-900 dark:text-white">Department &amp; Year</th>
                <th className="p-4 font-bold text-slate-900 dark:text-white">Points &amp; Rank</th>
                <th className="p-4 font-bold text-slate-900 dark:text-white min-w-[220px]">
                  Assign Access Designation
                </th>
                <th className="p-4 font-bold text-slate-900 dark:text-white text-right">Registered On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-[#2A323D]">
              {filteredUsers.map((usr: RegisteredUser) => {
                const isUpdating = updatingUserId === usr.id;
                const displayRole = formatRoleDisplayName(usr.roleName);
                const badgeVariant = getRoleBadgeVariant(usr.roleName);

                return (
                  <tr key={usr.id} className="hover:bg-slate-50 dark:hover:bg-[#1B222C]/60 transition-colors">
                    {/* User Info */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={usr.profilePhoto || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + usr.fullName}
                          alt={usr.fullName}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                        />
                        <div>
                          <div className="font-extrabold text-slate-900 dark:text-white text-sm">
                            {usr.fullName}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {usr.email}
                          </div>
                          <div className="mt-1 flex items-center gap-1.5">
                            <span className="text-[10px] font-mono font-bold text-[#0078D4] dark:text-[#00A4EF]">
                              {usr.studentId || 'MCC-STUDENT'}
                            </span>
                            {usr.enrollmentNumber && (
                              <span className="text-[10px] text-slate-400">
                                • {usr.enrollmentNumber}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Department & Year */}
                    <td className="p-4">
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        {usr.department || 'Computer Engineering'}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {usr.year || '3rd Year'} {usr.division ? `(${usr.division})` : ''}
                      </div>
                      <div className="text-[10px] text-slate-400">{usr.college || 'Marwadi University'}</div>
                    </td>

                    {/* Points & Rank */}
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="primary" className="font-extrabold text-xs">
                          {usr.communityPoints ?? 0} pts
                        </Badge>
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                          Rank #{usr.currentRank || 1}
                        </span>
                      </div>
                    </td>

                    {/* Designation / Role Selector */}
                    <td className="p-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <Badge variant={badgeVariant} className="text-[11px] font-bold">
                            {displayRole}
                          </Badge>
                          {isUpdating && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#00A4EF]" />}
                        </div>

                        <select
                          disabled={isUpdating}
                          value={displayRole}
                          onChange={(e) => handleRoleChange(usr.id, e.target.value, usr.fullName)}
                          className="w-full text-xs font-semibold bg-slate-50 dark:bg-[#0D1117] border border-slate-300 dark:border-[#2A323D] rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A4EF] focus:outline-none cursor-pointer"
                        >
                          {AVAILABLE_ROLES.map((r) => (
                            <option key={r} value={r} className="bg-white dark:bg-[#151B23]">
                              {r}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>

                    {/* Registered Date */}
                    <td className="p-4 text-right">
                      <div className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                        {usr.createdAt ? new Date(usr.createdAt).toLocaleDateString() : 'N/A'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {usr.createdAt ? new Date(usr.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </div>
                    </td>
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
