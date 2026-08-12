'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Users, Plus, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { TeamMember } from '@/types';

async function fetchAdminTeam(): Promise<TeamMember[]> {
  const res = await fetch('/api/team');
  if (!res.ok) return [];
  const json = await res.json();
  return json.data?.members || [];
}

export default function AdminTeamPage() {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [department, setDepartment] = useState('Computer Engineering');
  const [category, setCategory] = useState('CORE_LEAD');

  const { data: team = [], isLoading } = useQuery({
    queryKey: ['admin-team'],
    queryFn: fetchAdminTeam,
  });

  const createMemberMutation = useMutation({
    mutationFn: async (payload: { name: string; position: string; department: string; category: string }) => {
      const res = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to add team member');
      return json.data?.member;
    },
    onSuccess: (m) => {
      queryClient.invalidateQueries({ queryKey: ['admin-team'] });
      toast.success(`Team member "${m?.name || name}" added successfully!`);
      setName('');
      setPosition('');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to add team member.');
    },
  });

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !position.trim()) {
      toast.error('Name and position are required.');
      return;
    }
    createMemberMutation.mutate({ name: name.trim(), position: position.trim(), department, category });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-7 h-7 text-[#00A4EF]" /> Core Team &amp; Lead Management
          </h1>
          <p className="text-sm text-slate-600 dark:text-[#A8B0BB] mt-1">
            Manage lead privileges, department assignments, and alumni roster.
          </p>
        </div>
      </div>

      <Card className="p-6 space-y-4 border-slate-200 dark:border-[#2A323D] bg-white dark:bg-[#151B23]">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Plus className="w-4 h-4 text-[#00A4EF]" /> Add New Team Member
        </h2>

        <form onSubmit={handleAddMember} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Priya Sharma"
                className="w-full p-2.5 text-xs bg-slate-50 dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Role / Position *</label>
              <input
                type="text"
                required
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="e.g. AI &amp; Cloud Technical Lead"
                className="w-full p-2.5 text-xs bg-slate-50 dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Department</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full p-2.5 text-xs bg-slate-50 dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 text-xs bg-slate-50 dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="CORE_LEAD">Core Lead</option>
                <option value="FACULTY">Faculty Coordinator</option>
                <option value="VOLUNTEER">Volunteer</option>
              </select>
            </div>
          </div>

          <Button type="submit" variant="fluent" size="sm" disabled={createMemberMutation.isPending} className="font-bold">
            {createMemberMutation.isPending ? 'Saving Member...' : 'Add Team Member'}
          </Button>
        </form>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#00A4EF]" />
        </div>
      ) : team.length === 0 ? (
        <div className="text-center py-16 text-slate-500">No team members registered yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {team.map((m) => (
            <Card key={m.id} className="p-6 space-y-4 border-slate-200 dark:border-[#2A323D] bg-white dark:bg-[#151B23] text-center">
              <Image src={m.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300'} alt={m.name} width={80} height={80} className="w-20 h-20 rounded-2xl object-cover mx-auto border-2 border-[#00A4EF]" />
              <div>
                <Badge variant="primary" size="sm" className="mb-1">{m.category}</Badge>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{m.name}</h3>
                <p className="text-xs text-[#0078D4] dark:text-[#00A4EF] font-semibold">{m.position}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{m.department}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
