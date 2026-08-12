'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { NoticePriority } from '@/types';
import { toast } from 'sonner';
import { BellRing, Plus, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Notice } from '@/types';

async function fetchAdminNotices(): Promise<Notice[]> {
  const res = await fetch('/api/notices');
  if (!res.ok) return [];
  const json = await res.json();
  return json.data?.notices || [];
}

export default function AdminNoticesPage() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<NoticePriority>('Urgent');

  const { data: notices = [], isLoading } = useQuery({
    queryKey: ['admin-notices'],
    queryFn: fetchAdminNotices,
  });

  const createNoticeMutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const res = await fetch('/api/notices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to create notice');
      return json.data?.notice;
    },
    onSuccess: (n) => {
      queryClient.invalidateQueries({ queryKey: ['admin-notices'] });
      toast.success(`Published notice "${n?.title || title}" to homepage & student dashboards!`);
      setTitle('');
      setDescription('');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to publish notice.');
    },
  });

  const handleCreateNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    createNoticeMutation.mutate({
      title: title.trim(),
      description: description.trim(),
      priority,
      publishDate: new Date().toISOString(),
      isPinned: true,
      status: 'active',
    });
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <BellRing className="w-7 h-7 text-[#0078D4] dark:text-[#00A4EF]" /> Notice Board Management
        </h1>
        <p className="text-sm text-slate-600 dark:text-[#A8B0BB] mt-1">
          Publish announcements to the homepage and student portal notice widgets.
        </p>
      </div>

      {/* New Notice Form */}
      <Card className="p-6 space-y-4 border-slate-200 dark:border-[#2A323D] bg-white dark:bg-[#151B23]">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Plus className="w-4 h-4 text-[#00A4EF]" /> Publish New Announcement
        </h2>

        <form onSubmit={handleCreateNotice} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Notice Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Venue Change for Azure Cloud Workshop"
                className="w-full p-2.5 text-xs bg-slate-50 dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Priority Level *</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as NoticePriority)}
                className="w-full p-2.5 text-xs bg-slate-50 dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="Urgent">Urgent (High Priority)</option>
                <option value="Standard">Standard Notice</option>
                <option value="Low">Informational</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Announcement Body Text *</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide complete notice details..."
              className="w-full p-2.5 text-xs bg-slate-50 dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <Button type="submit" variant="fluent" size="sm" disabled={createNoticeMutation.isPending} className="font-bold">
            {createNoticeMutation.isPending ? 'Publishing...' : 'Publish Announcement'}
          </Button>
        </form>
      </Card>

      {/* Notices List */}
      <Card className="p-6 space-y-4 border-slate-200 dark:border-[#2A323D]">
        <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-[#2A323D] pb-3">
          Published Notices ({notices.length})
        </h2>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#00A4EF]" />
          </div>
        ) : notices.length === 0 ? (
          <div className="text-center py-12 text-slate-500">No active notices published yet.</div>
        ) : (
          <div className="space-y-3">
            {notices.map((n) => (
              <div key={n.id} className="p-4 rounded-xl bg-slate-50 dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant={n.priority === 'Urgent' ? 'danger' : 'purple'}>{n.priority}</Badge>
                  <span className="text-[10px] text-slate-500">{new Date(n.publishDate).toLocaleDateString()}</span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">{n.title}</h3>
                <p className="text-xs text-slate-600 dark:text-[#A8B0BB]">{n.description}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
