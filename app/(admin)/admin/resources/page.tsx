'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ResourceCategory, ResourceVisibility } from '@/types';
import { useRealtime } from '@/hooks/useRealtime';
import { toast } from 'sonner';
import { FolderUp, Upload, Lock, Globe, Radio, Shield, Users, CheckCircle2, Ticket, Sparkles } from 'lucide-react';

const CATEGORIES: ResourceCategory[] = [
  'Slides',
  'PDF',
  'Assignment',
  'Recording',
  'Source Code',
  'GitHub',
  'Microsoft Learn',
  'Practice Dataset',
  'ZIP',
  'Documentation'
];

const EVENTS_LIST = [
  { id: 'evt_01', title: 'Azure Cloud Architecture & Serverless Masterclass' },
  { id: 'evt_02', title: 'AI Engineer Challenge: GitHub Copilot & OpenAI Workshop' },
  { id: 'evt_03', title: 'Full-Stack Web Development Starter Bootcamp' },
  { id: 'evt_general', title: 'General MCC Community Resources (All Events)' }
];

const VISIBILITY_OPTIONS: { value: ResourceVisibility; label: string; description: string; badge: string; icon: React.ComponentType<{ className?: string }> }[] = [
  {
    value: 'Public',
    label: 'All Signed-in Users',
    description: 'Accessible to any authenticated student or member logged into the portal.',
    badge: 'success',
    icon: Globe
  },
  {
    value: 'Registered Students',
    label: 'Registered Event Members Only',
    description: 'Strictly restricted to students who have officially registered for the selected event.',
    badge: 'primary',
    icon: Ticket
  },
  {
    value: 'Checked-in Students Only',
    label: 'Checked-in Students Only',
    description: 'Requires QR code verification at the live venue. Pushed live during workshops.',
    badge: 'purple',
    icon: Lock
  },
  {
    value: 'Admin Only',
    label: 'Core Team & Admins Only',
    description: 'Internal documentation for MCC organizers and website administrators only.',
    badge: 'warning',
    icon: Shield
  }
];

export default function AdminResourcesPage() {
  const { emitLocalEvent } = useRealtime();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventId, setEventId] = useState('evt_01');
  const [category, setCategory] = useState<ResourceCategory>('Slides');
  const [visibility, setVisibility] = useState<ResourceVisibility>('Registered Students');
  const [blobUrl, setBlobUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const selectedEvent = EVENTS_LIST.find((e) => e.id === eventId) || EVENTS_LIST[0];
  const activeVisibilityConfig = VISIBILITY_OPTIONS.find((v) => v.value === visibility) || VISIBILITY_OPTIONS[1];

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !blobUrl) {
      toast.error('Resource Title and Storage URL/Link are required.');
      return;
    }

    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      const newRes = {
        title,
        description,
        eventId: selectedEvent.id,
        eventTitle: selectedEvent.title,
        category,
        visibility,
        blobUrl,
        uploadedAt: new Date().toISOString()
      };

      // Emit Realtime broadcast event (§48, §123)
      emitLocalEvent('LIVE_RESOURCE_UPLOADED', newRes);
      toast.success(`Live resource "${title}" shared successfully! Restricted to: ${activeVisibilityConfig.label}`, {
        description: `Target Event: ${selectedEvent.title}`
      });

      setTitle('');
      setDescription('');
      setBlobUrl('');
    }, 600);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <FolderUp className="w-7 h-7 text-[#0078D4] dark:text-[#00A4EF]" /> Share Event Resources
        </h1>
        <p className="text-sm text-slate-600 dark:text-[#A8B0BB] mt-1">
          Publish slides, source code starter kits, and practice datasets with custom access permissions (Signed-in Users or Registered Members Only).
        </p>
      </div>

      <form onSubmit={handleUpload} className="space-y-6">
        <Card className="p-6 space-y-5 border-slate-200 dark:border-[#2A323D] bg-white dark:bg-[#151B23]">
          <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-[#2A323D] pb-3 flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-500 animate-pulse" /> Resource Sharing & Access Control Uploader
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Resource Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Azure Functions Live Coding Starter Kit"
                className="w-full p-2.5 text-xs bg-slate-50 dark:bg-[#0D1117] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#0078D4] dark:focus:ring-[#00A4EF] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Resource Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ResourceCategory)}
                className="w-full p-2.5 text-xs bg-slate-50 dark:bg-[#0D1117] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0078D4] dark:focus:ring-[#00A4EF] focus:outline-none"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="bg-white dark:bg-[#151B23] text-slate-900 dark:text-white">
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Event Selector Option */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Associated Event *</label>
            <select
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              className="w-full p-2.5 text-xs bg-slate-50 dark:bg-[#0D1117] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0078D4] dark:focus:ring-[#00A4EF] focus:outline-none"
            >
              {EVENTS_LIST.map((e) => (
                <option key={e.id} value={e.id} className="bg-white dark:bg-[#151B23] text-slate-900 dark:text-white">
                  {e.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Resource Link / Blob Storage SAS URL *</label>
            <input
              type="url"
              required
              value={blobUrl}
              onChange={(e) => setBlobUrl(e.target.value)}
              placeholder="https://mccdevstorage.blob.core.windows.net/resources/starter.zip?sas_token"
              className="w-full p-2.5 text-xs bg-slate-50 dark:bg-[#0D1117] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#0078D4] dark:focus:ring-[#00A4EF] focus:outline-none font-mono"
            />
          </div>

          {/* Explicit Access Control Options */}
          <div className="space-y-2 pt-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              Sharing Access Control & Visibility Option *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {VISIBILITY_OPTIONS.map((opt) => {
                const IconComponent = opt.icon;
                const isSelected = visibility === opt.value;
                return (
                  <div
                    key={opt.value}
                    onClick={() => setVisibility(opt.value)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all space-y-1.5 ${
                      isSelected
                        ? 'bg-sky-500/10 dark:bg-sky-500/20 border-[#0078D4] dark:border-[#00A4EF] text-slate-900 dark:text-white shadow-md'
                        : 'bg-slate-50 dark:bg-[#0D1117] border-slate-200 dark:border-[#2A323D] text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold flex items-center gap-1.5 text-slate-900 dark:text-white">
                        <IconComponent className="w-4 h-4 text-[#0078D4] dark:text-[#00A4EF]" />
                        {opt.label}
                      </span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-[#0078D4] dark:text-[#00A4EF]" />}
                    </div>
                    <p className="text-[11px] leading-tight text-slate-600 dark:text-slate-400">{opt.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Access Rule Summary Card */}
          <div className="p-3.5 rounded-xl bg-sky-50 dark:bg-[#0D1117] border border-sky-200 dark:border-[#2A323D] text-xs space-y-1">
            <span className="font-semibold text-[#0078D4] dark:text-[#00A4EF] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Enforcement Summary:
            </span>
            <p className="text-slate-700 dark:text-slate-300 text-[11px]">
              When published, this resource for <strong className="text-slate-900 dark:text-white">{selectedEvent.title}</strong> will be restricted to{' '}
              <strong className="text-[#0078D4] dark:text-[#00A4EF]">{activeVisibilityConfig.label}</strong>. Unauthenticated visitors will be prompted to sign in first.
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Description / Instructions for Members</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief instructions for registered members on how to run this starter kit..."
              className="w-full p-2.5 text-xs bg-slate-50 dark:bg-[#0D1117] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#0078D4] dark:focus:ring-[#00A4EF] focus:outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <Button type="submit" variant="fluent" size="lg" isLoading={isUploading}>
              <Upload className="w-4 h-4" /> Share Resource
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
