'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Users, Plus, Upload, Trash2, Loader2, CheckCircle2, Lock } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { TeamMember } from '@/types';

const CATEGORY_ROLE_MAP: Record<string, string> = {
  FOUNDING_MEMBER: 'Founding Member',
  FACULTY_COORDINATORS: 'Faculty Coordinator',
  PRESIDENT: 'President & Student Ambassador',
  VICE_PRESIDENT: 'Vice President',
  TECHNICAL_TEAM: 'Technical Lead',
  EVENTS_TEAM: 'Events Lead',
  MEDIA_TEAM: 'Media Lead',
  CONTENT_TEAM: 'Content Lead',
  DESIGN_TEAM: 'Design Lead',
  VOLUNTEERS: 'Volunteer',
};

async function fetchAdminTeam(): Promise<TeamMember[]> {
  const res = await fetch('/api/team');
  if (!res.ok) return [];
  const json = await res.json();
  return json.data?.members || [];
}

export default function AdminTeamPage() {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('FOUNDING_MEMBER');
  const [position, setPosition] = useState(CATEGORY_ROLE_MAP['FOUNDING_MEMBER']);
  const [department, setDepartment] = useState('Computer Engineering');
  const [photo, setPhoto] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const { data: team = [], isLoading } = useQuery({
    queryKey: ['admin-team'],
    queryFn: fetchAdminTeam,
  });

  const handleCategoryChange = (newCat: string) => {
    setCategory(newCat);
    const autoRole = CATEGORY_ROLE_MAP[newCat] || newCat;
    setPosition(autoRole);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('container', 'avatars');

      const res = await fetch('/api/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Upload failed');

      setPhoto(json.data.url);
      toast.success('Profile photo uploaded successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload profile photo.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const createMemberMutation = useMutation({
    mutationFn: async (payload: { name: string; position: string; department: string; category: string; photo?: string }) => {
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
      queryClient.invalidateQueries({ queryKey: ['team'] });
      toast.success(`Team member "${m?.name || name}" added successfully!`);
      setName('');
      setPhoto('');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to add team member.');
    },
  });

  const deleteMemberMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/team/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to delete member');
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-team'] });
      queryClient.invalidateQueries({ queryKey: ['team'] });
      toast.success('Team member deleted successfully!');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to delete member.');
    },
  });

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Full Name is required.');
      return;
    }
    const finalRole = position || CATEGORY_ROLE_MAP[category] || 'Founding Member';
    createMemberMutation.mutate({
      name: name.trim(),
      position: finalRole,
      department,
      category,
      photo: photo.trim() || undefined,
    });
  };

  const handleDeleteMember = (id: string, memberName: string) => {
    if (confirm(`Are you sure you want to delete ${memberName}?`)) {
      deleteMemberMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-7 h-7 text-[#00A4EF]" /> Core Team &amp; Lead Management
          </h1>
          <p className="text-sm text-slate-600 dark:text-[#A8B0BB] mt-1">
            Manage founding members, presidents, department leads, and faculty coordinators.
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
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 mb-1">
                Role / Position <Lock className="w-3 h-3 text-amber-400" />
                <span className="text-[10px] text-slate-400 font-normal">(Auto-fetched from Category)</span>
              </label>
              <input
                type="text"
                readOnly
                value={position || CATEGORY_ROLE_MAP[category] || 'Founding Member'}
                className="w-full p-2.5 text-xs bg-slate-100 dark:bg-[#1B222C] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-700 dark:text-[#A8B0BB] font-bold cursor-not-allowed focus:outline-none"
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
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Category *</label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full p-2.5 text-xs bg-slate-50 dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:outline-none font-medium"
              >
                <option value="FOUNDING_MEMBER">Founding Member</option>
                <option value="FACULTY_COORDINATORS">Faculty Coordinator</option>
                <option value="PRESIDENT">President</option>
                <option value="VICE_PRESIDENT">Vice President</option>
                <option value="TECHNICAL_TEAM">Technical Lead</option>
                <option value="EVENTS_TEAM">Events Lead</option>
                <option value="MEDIA_TEAM">Media Lead</option>
                <option value="CONTENT_TEAM">Content Lead</option>
                <option value="DESIGN_TEAM">Design Lead</option>
                <option value="VOLUNTEERS">Volunteer</option>
              </select>
            </div>
          </div>

          {/* Profile Photo */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">Profile Photo</label>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                value={photo}
                onChange={(e) => setPhoto(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="flex-1 p-2.5 text-xs bg-slate-50 dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:outline-none"
              />
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold bg-sky-500/10 hover:bg-sky-500/20 text-[#00A4EF] rounded-xl border border-sky-500/30 transition-all shrink-0">
                {uploadingPhoto ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                <span>Upload Avatar Photo</span>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  disabled={uploadingPhoto}
                />
              </label>
            </div>
            {photo && (
              <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Photo set: {photo}
              </p>
            )}
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
            <Card key={m.id} className="p-6 space-y-4 border-slate-200 dark:border-[#2A323D] bg-white dark:bg-[#151B23] text-center relative group">
              <Image
                src={m.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300'}
                alt={m.name}
                width={80}
                height={80}
                className="w-20 h-20 rounded-2xl object-cover mx-auto border-2 border-[#00A4EF]"
              />
              <div>
                <Badge variant="primary" size="sm" className="mb-1">
                  {m.category === 'FOUNDING_MEMBER' ? 'Founding Member' : m.category}
                </Badge>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{m.name}</h3>
                <p className="text-xs text-[#0078D4] dark:text-[#00A4EF] font-semibold">{m.position}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{m.department}</p>
              </div>

              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDeleteMember(m.id, m.name)}
                className="w-full gap-1 text-xs font-semibold"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete Member
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
