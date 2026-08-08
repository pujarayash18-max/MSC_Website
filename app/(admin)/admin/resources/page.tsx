'use client';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ResourceCategory, ResourceVisibility } from '@/types';
import { useRealtime } from '@/hooks/useRealtime';
import { toast } from 'sonner';
import { FolderUp, Upload, FileText, Lock, Globe, Shield, Radio } from 'lucide-react';

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

const VISIBILITIES: ResourceVisibility[] = [
  'Public',
  'Registered Students',
  'Checked-in Students Only',
  'Core Team Only',
  'Admin Only'
];

export default function AdminResourcesPage() {
  const { emitLocalEvent } = useRealtime();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ResourceCategory>('Slides');
  const [visibility, setVisibility] = useState<ResourceVisibility>('Checked-in Students Only');
  const [blobUrl, setBlobUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !blobUrl) {
      toast.error('Title and URL/File are required.');
      return;
    }

    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      const newRes = {
        title,
        description,
        category,
        visibility,
        blobUrl,
        uploadedAt: new Date().toISOString()
      };

      // Emit Realtime event (§48, §123)
      emitLocalEvent('LIVE_RESOURCE_UPLOADED', newRes);
      toast.success(`Live resource "${title}" published instantly to eligible student dashboards!`);

      setTitle('');
      setDescription('');
      setBlobUrl('');
    }, 600);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <FolderUp className="w-7 h-7 text-sky-400" /> Live Event Resource Management (§48, §71)
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Upload presentation slides, live coding files, datasets, and recordings. Broadcasts instantly to students via SignalR.
        </p>
      </div>

      <form onSubmit={handleUpload} className="space-y-6">
        <Card className="p-6 space-y-4 border-sky-500/30">
          <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" /> Live Broadcast Resource Uploader
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Resource Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Azure Functions Live Coding Starter Kit"
                className="w-full p-2.5 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Resource Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ResourceCategory)}
                className="w-full p-2.5 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Resource Link / Blob Storage SAS URL *</label>
            <input
              type="url"
              required
              value={blobUrl}
              onChange={(e) => setBlobUrl(e.target.value)}
              placeholder="https://mccdevstorage.blob.core.windows.net/resources/starter.zip?sas_token"
              className="w-full p-2.5 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-sky-500 focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Access Level & Visibility Tier (§48)</label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as ResourceVisibility)}
              className="w-full p-2.5 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
            >
              {VISIBILITIES.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 mt-1">
              "Checked-in Students Only" restricts access strictly to students whose QR scan was verified at the venue.
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Description / Joining Instructions</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief instructions on how to use this practice dataset during the live session..."
              className="w-full p-2.5 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <Button type="submit" variant="fluent" size="lg" isLoading={isUploading}>
              <Upload className="w-4 h-4" /> Broadcast Live Resource
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
