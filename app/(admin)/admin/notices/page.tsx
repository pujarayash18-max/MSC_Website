'use client';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { INITIAL_NOTICES } from '@/lib/services/dataService';
import { NoticePriority } from '@/types';
import { toast } from 'sonner';
import { BellRing, Plus, Pin, Trash2, CheckCircle2 } from 'lucide-react';

export default function AdminNoticesPage() {
  const [notices, setNotices] = useState(INITIAL_NOTICES);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<NoticePriority>('Urgent');

  const handleCreateNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    const newN = {
      id: `ntc_${Date.now()}`,
      noticeId: `ntc_${Date.now()}`,
      title,
      description,
      priority,
      publishDate: new Date().toISOString(),
      isPinned: true,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active' as const
    };

    setNotices([newN, ...notices]);
    toast.success(`Published notice "${title}" to homepage & student dashboards!`);
    setTitle('');
    setDescription('');
  };

  const togglePin = (id: string) => {
    setNotices((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isPinned: !n.isPinned } : n))
    );
    toast.info('Notice pin status toggled.');
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <BellRing className="w-7 h-7 text-[#0078D4] dark:text-[#00A4EF]" /> Notice Board Management (§76)
        </h1>
        <p className="text-sm text-slate-600 dark:text-[#A8B0BB] mt-1">
          Publish announcements to the homepage and student portal notice widgets.
        </p>
      </div>

      {/* New Notice Form */}
      <Card className="p-6 space-y-4 border-slate-200 dark:border-[#2A323D] bg-white dark:bg-[#151B23]">
        <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-[#2A323D] pb-3">Create & Pin Announcement</h3>

        <form onSubmit={handleCreateNotice} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Notice Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Azure AI Hackathon Winner Announcement"
                className="w-full p-2.5 text-xs bg-slate-50 dark:bg-[#0D1117] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#0078D4] dark:focus:ring-[#00A4EF] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Priority Category</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as NoticePriority)}
                className="w-full p-2.5 text-xs bg-slate-50 dark:bg-[#0D1117] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0078D4] dark:focus:ring-[#00A4EF] focus:outline-none"
              >
                <option value="Urgent" className="bg-white dark:bg-[#151B23]">Urgent</option>
                <option value="Event" className="bg-white dark:bg-[#151B23]">Event</option>
                <option value="Recruitment" className="bg-white dark:bg-[#151B23]">Recruitment</option>
                <option value="Placement" className="bg-white dark:bg-[#151B23]">Placement</option>
                <option value="General" className="bg-white dark:bg-[#151B23]">General</option>
                <option value="Microsoft Learn" className="bg-white dark:bg-[#151B23]">Microsoft Learn</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Description / Full Content *</label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Announcement details..."
              className="w-full p-2.5 text-xs bg-slate-50 dark:bg-[#0D1117] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#0078D4] dark:focus:ring-[#00A4EF] focus:outline-none"
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" variant="fluent" size="sm">
              <Plus className="w-4 h-4" /> Publish Notice
            </Button>
          </div>
        </form>
      </Card>

      {/* Notices List */}
      <div className="space-y-3">
        {notices.map((n) => (
          <Card key={n.id} className="p-5 border-slate-200 dark:border-[#2A323D] bg-white dark:bg-[#151B23] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant={n.priority === 'Urgent' ? 'danger' : 'purple'}>{n.priority}</Badge>
                {n.isPinned && <Badge variant="warning" className="gap-1"><Pin className="w-3 h-3" /> Pinned</Badge>}
              </div>

              <Button variant="outline" size="sm" onClick={() => togglePin(n.id)}>
                {n.isPinned ? 'Unpin' : 'Pin to Top'}
              </Button>
            </div>

            <h4 className="text-sm font-bold text-slate-900 dark:text-white">{n.title}</h4>
            <p className="text-xs text-slate-600 dark:text-[#A8B0BB]">{n.description}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
