'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Image as ImageIcon, Loader2, Plus } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

async function fetchGalleryAlbums() {
  const res = await fetch('/api/gallery');
  if (!res.ok) return [];
  const json = await res.json();
  return json.data?.albums || [];
}

export default function AdminGalleryPage() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('WORKSHOP');
  const [coverPhoto, setCoverPhoto] = useState('');

  const { data: albums = [], isLoading } = useQuery({
    queryKey: ['admin-gallery-albums'],
    queryFn: fetchGalleryAlbums,
  });

  const createAlbumMutation = useMutation({
    mutationFn: async (payload: { title: string; category: string; coverPhoto?: string }) => {
      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Album creation failed');
      return json.data?.album;
    },
    onSuccess: (a) => {
      queryClient.invalidateQueries({ queryKey: ['admin-gallery-albums'] });
      toast.success(`Gallery Album "${a?.title || title}" published to website!`);
      setTitle('');
      setCoverPhoto('');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to create album.');
    },
  });

  const handleCreateAlbum = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Album title is required.');
      return;
    }
    createAlbumMutation.mutate({ title: title.trim(), category, coverPhoto: coverPhoto.trim() || undefined });
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <ImageIcon className="w-7 h-7 text-[#0078D4] dark:text-[#00A4EF]" /> Gallery &amp; Media Manager
        </h1>
        <p className="text-sm text-slate-600 dark:text-[#A8B0BB] mt-1">
          Upload workshop photo albums, hackathon highlights, and media showcases.
        </p>
      </div>

      <Card className="p-6 space-y-4 border-slate-200 dark:border-[#2A323D] bg-white dark:bg-[#151B23]">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Plus className="w-4 h-4 text-[#00A4EF]" /> Create New Photo Album
        </h2>

        <form onSubmit={handleCreateAlbum} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Album Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Azure AI Hackathon 2026 Keynote Moments"
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
                <option value="WORKSHOP">Workshop</option>
                <option value="HACKATHON">Hackathon</option>
                <option value="BOOTCAMP">Bootcamp</option>
                <option value="COMMUNITY">Community</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Cover Photo URL</label>
            <input
              type="text"
              value={coverPhoto}
              onChange={(e) => setCoverPhoto(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full p-2.5 text-xs bg-slate-50 dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <Button type="submit" variant="fluent" size="sm" disabled={createAlbumMutation.isPending} className="font-bold">
            {createAlbumMutation.isPending ? 'Publishing Album...' : 'Publish Gallery Album'}
          </Button>
        </form>
      </Card>

      <Card className="p-6 space-y-4 border-slate-200 dark:border-[#2A323D]">
        <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-[#2A323D] pb-3">
          Published Albums ({albums.length})
        </h2>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#00A4EF]" />
          </div>
        ) : albums.length === 0 ? (
          <div className="text-center py-12 text-slate-500">No gallery albums published yet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {albums.map((alb: { id: string; title: string; category: string; coverPhoto?: string; _count?: { images: number } }) => (
              <div key={alb.id} className="p-4 rounded-xl bg-slate-50 dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] space-y-2">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">{alb.title}</h3>
                <p className="text-xs text-sky-500 font-medium">{alb.category} • {alb._count?.images || 0} Photos</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
