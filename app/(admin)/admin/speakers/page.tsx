'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { toast } from 'sonner';
import { Mic, Plus, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Speaker } from '@/types';

async function fetchAdminSpeakers(): Promise<Speaker[]> {
  const res = await fetch('/api/speakers');
  if (!res.ok) return [];
  const json = await res.json();
  return json.data?.speakers || [];
}

export default function AdminSpeakersPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const [organization, setOrganization] = useState('');
  const [bio, setBio] = useState('');
  const [photo, setPhoto] = useState('');
  const [expertiseInput, setExpertiseInput] = useState('');

  const { data: speakers = [], isLoading } = useQuery({
    queryKey: ['admin-speakers'],
    queryFn: fetchAdminSpeakers,
  });

  const createSpeakerMutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const res = await fetch('/api/speakers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to create speaker');
      return json.data?.speaker;
    },
    onSuccess: (spk) => {
      queryClient.invalidateQueries({ queryKey: ['admin-speakers'] });
      toast.success(`Speaker "${spk?.name || name}" added successfully!`);
      setIsModalOpen(false);
      setName('');
      setDesignation('');
      setOrganization('');
      setBio('');
      setPhoto('');
      setExpertiseInput('');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to add speaker.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !organization || !designation || !bio) {
      toast.error('Please fill in required speaker fields.');
      return;
    }

    createSpeakerMutation.mutate({
      name: name.trim(),
      organization: organization.trim(),
      designation: designation.trim(),
      bio: bio.trim(),
      photo: photo.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
      expertise: expertiseInput.split(',').map((s) => s.trim()).filter(Boolean),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Mic className="w-7 h-7 text-[#00A4EF]" /> Guest Speaker Registry
          </h1>
          <p className="text-sm text-slate-600 dark:text-[#A8B0BB] mt-1">
            Manage profiles, topics, and session schedules for keynotes and workshop trainers.
          </p>
        </div>

        <Button variant="fluent" size="sm" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4" /> Add Speaker Profile
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#00A4EF]" />
        </div>
      ) : speakers.length === 0 ? (
        <div className="text-center py-16 text-slate-500">No speakers registered yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {speakers.map((spk) => (
            <Card key={spk.id} className="p-6 space-y-4 border-slate-200 dark:border-[#2A323D] bg-white dark:bg-[#151B23]">
              <div className="flex items-center gap-4">
                <Image src={spk.photo || '/avatar-placeholder.png'} alt={spk.name} width={64} height={64} className="w-16 h-16 rounded-xl object-cover border border-[#00A4EF]" />
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{spk.name}</h3>
                  <p className="text-xs text-[#0078D4] dark:text-[#00A4EF] font-semibold">{spk.designation}</p>
                  <p className="text-[11px] text-slate-600 dark:text-[#A8B0BB]">{spk.organization}</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-[#A8B0BB] line-clamp-2">{spk.bio}</p>

              {spk.expertise && spk.expertise.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {spk.expertise.map((exp) => (
                    <Badge key={exp} variant="purple" size="sm">{exp}</Badge>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Add Speaker Modal */}
      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Guest Speaker Profile">
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-bold block mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dr. Rajesh Patel"
                className="w-full p-2.5 text-xs bg-slate-50 dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold block mb-1">Designation *</label>
                <input
                  type="text"
                  required
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="Principal Cloud Architect"
                  className="w-full p-2.5 text-xs bg-slate-50 dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">Organization *</label>
                <input
                  type="text"
                  required
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="Microsoft India"
                  className="w-full p-2.5 text-xs bg-slate-50 dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold block mb-1">Photo URL</label>
              <input
                type="url"
                value={photo}
                onChange={(e) => setPhoto(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full p-2.5 text-xs bg-slate-50 dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold block mb-1">Expertise Tags (comma separated)</label>
              <input
                type="text"
                value={expertiseInput}
                onChange={(e) => setExpertiseInput(e.target.value)}
                placeholder="Azure Architecture, Serverless, AI"
                className="w-full p-2.5 text-xs bg-slate-50 dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold block mb-1">Biography *</label>
              <textarea
                required
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Brief professional background..."
                className="w-full p-2.5 text-xs bg-slate-50 dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <Button type="submit" variant="fluent" disabled={createSpeakerMutation.isPending} className="w-full font-bold">
              {createSpeakerMutation.isPending ? 'Saving...' : 'Save Speaker Profile'}
            </Button>
          </form>
        </Modal>
      )}
    </div>
  );
}
