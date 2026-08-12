'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Image as ImageIcon,
  Video,
  Music,
  Upload,
  Plus,
  Trash2,
  Loader2,
  FileCheck,
  CheckCircle2,
  X,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface MediaUploadItem {
  id: string;
  url: string;
  name: string;
  type: 'image' | 'video' | 'audio';
}

function detectMediaType(filename: string): 'image' | 'video' | 'audio' {
  const ext = filename.split('.').pop()?.split('?')[0].toLowerCase() || '';
  if (['mp4', 'webm', 'mov', 'm4v'].includes(ext)) return 'video';
  if (['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac'].includes(ext)) return 'audio';
  return 'image';
}

async function fetchGalleryAlbums() {
  const res = await fetch('/api/gallery');
  if (!res.ok) return [];
  const json = await res.json();
  return json.data?.albums || [];
}

export default function AdminGalleryPage() {
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('WORKSHOPS');
  const [description, setDescription] = useState('');
  const [coverPhoto, setCoverPhoto] = useState('');

  // Local file uploads state
  const [uploading, setUploading] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [uploadedMediaList, setUploadedMediaList] = useState<MediaUploadItem[]>([]);

  const { data: albums = [], isLoading } = useQuery({
    queryKey: ['admin-gallery-albums'],
    queryFn: fetchGalleryAlbums,
  });

  // Cover Image Upload Handler
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('container', 'gallery');

      const res = await fetch('/api/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Upload failed');

      setCoverPhoto(json.data.url);
      toast.success('Cover photo uploaded successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload cover photo.');
    } finally {
      setUploadingCover(false);
    }
  };

  // Concurrent Multi-Media Files Upload Handler (.jpg, .png, .mp3, .mp4, .webm, .mov)
  const processFilesUpload = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadProgress({ current: 0, total: files.length });

    let completedCount = 0;

    try {
      const uploadPromises = Array.from(files).map(async (file, idx) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('container', 'gallery');

        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            credentials: 'include',
            body: formData,
          });

          const json = await res.json();
          if (res.ok && json.success) {
            const type = detectMediaType(file.name);
            completedCount++;
            setUploadProgress({ current: completedCount, total: files.length });
            return {
              id: `upload-${Date.now()}-${idx}-${Math.random()}`,
              url: json.data.url,
              name: file.name,
              type,
            };
          }
        } catch {
          // ignore single file failure
        }
        return null;
      });

      const results = await Promise.all(uploadPromises);
      const validResults = results.filter(Boolean) as MediaUploadItem[];

      setUploadedMediaList((prev) => [...prev, ...validResults]);
      toast.success(`Successfully uploaded ${validResults.length} file(s)!`);
    } catch (err: any) {
      toast.error(err.message || 'Error uploading multiple files.');
    } finally {
      setUploading(false);
      setUploadProgress({ current: 0, total: 0 });
    }
  };

  const handleMediaFilesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFilesUpload(e.target.files);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFilesUpload(e.dataTransfer.files);
    }
  };

  const removeUploadedItem = (id: string) => {
    setUploadedMediaList((prev) => prev.filter((item) => item.id !== id));
  };

  // Create Album Mutation
  const createAlbumMutation = useMutation({
    mutationFn: async (payload: any) => {
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
      queryClient.invalidateQueries({ queryKey: ['public-gallery'] });
      toast.success(`Gallery Showcase "${a?.title || title}" published!`);
      setTitle('');
      setDescription('');
      setCoverPhoto('');
      setUploadedMediaList([]);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to create album.');
    },
  });

  // Delete Individual Media Item Mutation
  const deleteMediaMutation = useMutation({
    mutationFn: async (mediaId: string) => {
      const res = await fetch(`/api/gallery/${mediaId}?type=image`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Delete media failed');
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-gallery-albums'] });
      queryClient.invalidateQueries({ queryKey: ['public-gallery'] });
      toast.success('Media file deleted successfully!');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to delete file.');
    },
  });

  // Delete Entire Album Mutation
  const deleteAlbumMutation = useMutation({
    mutationFn: async (albumId: string) => {
      const res = await fetch(`/api/gallery/${albumId}?type=album`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Delete album failed');
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-gallery-albums'] });
      queryClient.invalidateQueries({ queryKey: ['public-gallery'] });
      toast.success('Gallery album deleted successfully!');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to delete album.');
    },
  });

  const handleCreateAlbum = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Album title is required.');
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      category,
      coverPhoto: coverPhoto.trim() || undefined,
      images: uploadedMediaList.map((m) => ({
        url: m.url,
        type: m.type,
        title: m.name,
      })),
    };

    createAlbumMutation.mutate(payload);
  };

  const handleDeleteMedia = (mediaId: string, mediaTitle: string) => {
    if (confirm(`Are you sure you want to delete "${mediaTitle}"?`)) {
      deleteMediaMutation.mutate(mediaId);
    }
  };

  const handleDeleteAlbum = (albumId: string, albumTitle: string) => {
    if (confirm(`Are you sure you want to delete the album "${albumTitle}" and all its media files?`)) {
      deleteAlbumMutation.mutate(albumId);
    }
  };

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <ImageIcon className="w-7 h-7 text-[#0078D4] dark:text-[#00A4EF]" /> Gallery &amp; Multi-Media Manager
        </h1>
        <p className="text-sm text-slate-600 dark:text-[#A8B0BB] mt-1">
          Select multiple photos, event videos (.MP4/.WebM), and audio clips (.MP3/.WAV) at once via drag &amp; drop or file picker.
        </p>
      </div>

      <Card className="p-6 space-y-6 border-slate-200 dark:border-[#2A323D] bg-white dark:bg-[#151B23]">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Plus className="w-4 h-4 text-[#00A4EF]" /> Create New Multi-Media Album
        </h2>

        <form onSubmit={handleCreateAlbum} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Album Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Azure AI Hackathon 2026 Keynote &amp; Highlights"
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
                <option value="WORKSHOPS">Workshops</option>
                <option value="HACKATHONS">Hackathons</option>
                <option value="COMMUNITY_MEETUPS">Community Meetups</option>
                <option value="BEHIND_THE_SCENES">Behind the Scenes</option>
                <option value="CONFERENCES">Conferences</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Description (Optional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Photos, videos, and keynote audio clips from national hackathon..."
              className="w-full p-2.5 text-xs bg-slate-50 dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          {/* Cover Photo Upload & URL */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">Album Cover Photo</label>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                value={coverPhoto}
                onChange={(e) => setCoverPhoto(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="flex-1 p-2.5 text-xs bg-slate-50 dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:outline-none"
              />
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold bg-sky-500/10 hover:bg-sky-500/20 text-[#00A4EF] rounded-xl border border-sky-500/30 transition-all shrink-0">
                {uploadingCover ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                <span>Upload Cover Image</span>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handleCoverUpload}
                  className="hidden"
                  disabled={uploadingCover}
                />
              </label>
            </div>
            {coverPhoto && (
              <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Cover image set: {coverPhoto}
              </p>
            )}
          </div>

          {/* DRAG & DROP MULTI-FILE UPLOADER ZONE */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="p-6 bg-slate-50 dark:bg-[#0B0F14] border-2 border-dashed border-sky-500/30 dark:border-[#2A323D] hover:border-sky-500 rounded-2xl space-y-4 text-center transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-center gap-3 text-sky-400">
              <ImageIcon className="w-7 h-7 group-hover:scale-110 transition-transform" />
              <Video className="w-7 h-7 text-rose-400 group-hover:scale-110 transition-transform" />
              <Music className="w-7 h-7 text-emerald-400 group-hover:scale-110 transition-transform" />
            </div>

            <div>
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Drag &amp; Drop Multiple Media Files Here or Click to Browse
              </h4>
              <p className="text-xs text-slate-500 dark:text-[#A8B0BB] mt-1 max-w-md mx-auto">
                Select multiple JPG, PNG, MP3, MP4, WebM files at once. All selected items will upload concurrently into this album.
              </p>
            </div>

            <label className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 text-xs font-extrabold bg-[#0078D4] dark:bg-[#00A4EF] text-white rounded-xl shadow-lg shadow-sky-500/25 hover:opacity-90 transition-all">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              <span>
                {uploading
                  ? `Uploading ${uploadProgress.current} of ${uploadProgress.total} Files...`
                  : 'Select Multiple Files (Images, Videos, Audios)'}
              </span>
              <input
                type="file"
                multiple
                accept="image/*,video/*,audio/*,.jpg,.jpeg,.png,.webp,.gif,.mp4,.webm,.mov,.mp3,.wav,.ogg,.m4a"
                onChange={handleMediaFilesUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>

            {/* Uploaded Items List */}
            {uploadedMediaList.length > 0 && (
              <div className="pt-4 border-t border-slate-200 dark:border-[#2A323D] space-y-3 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Attached Staged Files ({uploadedMediaList.length}):
                  </span>
                  <button
                    type="button"
                    onClick={() => setUploadedMediaList([])}
                    className="text-[11px] text-rose-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <X className="w-3 h-3" /> Clear All Staged
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                  {uploadedMediaList.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 bg-white dark:bg-[#151B23] border border-slate-200 dark:border-[#2A323D] rounded-xl flex items-center justify-between gap-2 text-xs shadow-sm"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {item.type === 'video' ? (
                          <Badge variant="danger" size="sm" className="gap-1 shrink-0">
                            <Video className="w-3 h-3" /> MP4
                          </Badge>
                        ) : item.type === 'audio' ? (
                          <Badge variant="success" size="sm" className="gap-1 shrink-0">
                            <Music className="w-3 h-3" /> MP3
                          </Badge>
                        ) : (
                          <Badge variant="primary" size="sm" className="gap-1 shrink-0">
                            <ImageIcon className="w-3 h-3" /> JPG/PNG
                          </Badge>
                        )}
                        <span className="text-slate-800 dark:text-slate-200 font-medium truncate">{item.name}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeUploadedItem(item.id)}
                        className="text-slate-400 hover:text-rose-500 p-1 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Button
            type="submit"
            variant="fluent"
            size="lg"
            className="w-full font-bold shadow-lg gap-2"
            disabled={createAlbumMutation.isPending}
          >
            {createAlbumMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileCheck className="w-4 h-4" />}
            Publish Multi-Media Album to Website
          </Button>
        </form>
      </Card>

      {/* Published Albums & Individual File Deletion Section */}
      <Card className="p-6 space-y-6 border-slate-200 dark:border-[#2A323D] bg-white dark:bg-[#151B23]">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">Published Albums &amp; Attached Files ({albums.length})</h2>

        {isLoading ? (
          <div className="py-8 text-center"><Loader2 className="w-6 h-6 animate-spin text-[#00A4EF] mx-auto" /></div>
        ) : albums.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">No albums published yet.</div>
        ) : (
          <div className="space-y-6">
            {albums.map((album: any) => (
              <div
                key={album.id}
                className="p-5 rounded-2xl border border-slate-200 dark:border-[#2A323D] bg-slate-50 dark:bg-[#0B0F14] space-y-4"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="primary" size="sm">{album.category}</Badge>
                      <span className="text-[11px] text-slate-400 font-medium">{(album.images || []).length} Media Items</span>
                    </div>
                    <h4 className="text-base font-extrabold text-slate-900 dark:text-white">{album.title}</h4>
                    {album.description && <p className="text-xs text-slate-500">{album.description}</p>}
                  </div>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteAlbum(album.id, album.title)}
                    className="gap-1.5 font-bold shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete Album
                  </Button>
                </div>

                {/* Individual Attached Media Files with Delete Button */}
                {(album.images || []).length > 0 && (
                  <div className="pt-3 border-t border-slate-200 dark:border-[#2A323D] space-y-2">
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                      Individual Uploaded Media Files (JPG/PNG/MP3/MP4):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(album.images || []).map((img: any) => {
                        const fileUrl = img.blobUrl || img.imageUrl || img.url || '';
                        const type = detectMediaType(fileUrl);
                        const fileName = img.title || img.caption || 'Media file';

                        return (
                          <div
                            key={img.id}
                            className="p-2.5 bg-white dark:bg-[#151B23] border border-slate-200 dark:border-[#2A323D] rounded-xl flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              {type === 'video' ? (
                                <Badge variant="danger" size="sm" className="gap-1 shrink-0">
                                  <Video className="w-3 h-3" /> MP4/Video
                                </Badge>
                              ) : type === 'audio' ? (
                                <Badge variant="success" size="sm" className="gap-1 shrink-0">
                                  <Music className="w-3 h-3" /> MP3/Audio
                                </Badge>
                              ) : (
                                <Badge variant="primary" size="sm" className="gap-1 shrink-0">
                                  <ImageIcon className="w-3 h-3" /> Image
                                </Badge>
                              )}
                              <span className="text-slate-800 dark:text-slate-200 font-semibold truncate">{fileName}</span>
                            </div>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteMedia(img.id, fileName)}
                              className="text-rose-500 border-rose-500/30 hover:bg-rose-500/10 gap-1 h-7 text-[11px] px-2 shrink-0 font-bold"
                            >
                              <Trash2 className="w-3 h-3" /> Delete File
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
