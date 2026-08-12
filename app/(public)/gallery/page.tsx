'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { useQuery } from '@tanstack/react-query';
import { Video, Music, Image as ImageIcon, Loader2, Sparkles } from 'lucide-react';

interface MediaItem {
  id: string;
  title: string;
  category: string;
  url: string;
  type: 'image' | 'video' | 'audio';
  albumTitle?: string;
}

function getMediaType(url: string, declaredType?: string): 'image' | 'video' | 'audio' {
  if (declaredType === 'video' || declaredType === 'audio') return declaredType;
  if (!url) return 'image';
  const clean = url.split('?')[0].toLowerCase();
  if (clean.endsWith('.mp4') || clean.endsWith('.webm') || clean.endsWith('.mov') || clean.endsWith('.m4v') || clean.includes('.mp4')) return 'video';
  if (clean.endsWith('.mp3') || clean.endsWith('.wav') || clean.endsWith('.ogg') || clean.endsWith('.m4a') || clean.includes('.mp3')) return 'audio';
  return 'image';
}

const FALLBACK_DEMO_ITEMS: MediaItem[] = [
  { id: 'demo-1', title: 'Azure AI Masterclass Keynote', category: 'WORKSHOPS', url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80', type: 'image' },
  { id: 'demo-2', title: 'National Hackathon Coding Arena', category: 'HACKATHONS', url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&q=80', type: 'image' },
  { id: 'demo-3', title: 'Hands-on Azure Lab Workshop', category: 'WORKSHOPS', url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80', type: 'image' },
  { id: 'demo-4', title: 'Core Team Strategy Meeting 2026', category: 'COMMUNITY_MEETUPS', url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80', type: 'image' },
  { id: 'demo-5', title: 'Azure Serverless Code Jam', category: 'WORKSHOPS', url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80', type: 'image' },
  { id: 'demo-6', title: 'Hackathon Award Ceremony', category: 'HACKATHONS', url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80', type: 'image' },
];

async function fetchPublicGallery(): Promise<MediaItem[]> {
  try {
    const res = await fetch('/api/gallery', { cache: 'no-store' });
    if (!res.ok) return FALLBACK_DEMO_ITEMS;
    const json = await res.json();
    const albums = json.data?.albums || [];

    const fetchedItems: MediaItem[] = [];
    const seenUrls = new Set<string>();

    albums.forEach((album: any) => {
      const albumCategory = album.category || 'WORKSHOPS';

      // 1. Add Cover Image if available and not duplicated
      if (album.coverImage && !seenUrls.has(album.coverImage)) {
        seenUrls.add(album.coverImage);
        fetchedItems.push({
          id: `cover-${album.id}`,
          title: album.title,
          category: albumCategory,
          url: album.coverImage,
          type: getMediaType(album.coverImage),
          albumTitle: album.title,
        });
      }

      // 2. Add all attached uploaded images/videos/audio in album
      const albumImages = album.images || [];
      albumImages.forEach((img: any) => {
        const fileUrl = img.blobUrl || img.imageUrl || img.url;
        if (fileUrl && !seenUrls.has(fileUrl)) {
          seenUrls.add(fileUrl);
          fetchedItems.push({
            id: img.id || `img-${Math.random()}`,
            title: img.title || img.caption || album.title,
            category: albumCategory,
            url: fileUrl,
            type: getMediaType(fileUrl, img.type),
            albumTitle: album.title,
          });
        }
      });
    });

    // Return live database items if available; otherwise show fallbacks
    return fetchedItems.length > 0 ? fetchedItems : FALLBACK_DEMO_ITEMS;
  } catch {
    return FALLBACK_DEMO_ITEMS;
  }
}

export default function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [lightboxMedia, setLightboxMedia] = useState<MediaItem | null>(null);

  const { data: mediaItems = FALLBACK_DEMO_ITEMS, isLoading } = useQuery({
    queryKey: ['public-gallery'],
    queryFn: fetchPublicGallery,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  const categories = ['All', 'Workshops', 'Hackathons', 'Community', 'Videos', 'Audio'];

  const filtered = mediaItems.filter((item) => {
    if (selectedCategory === 'All') return true;
    if (selectedCategory === 'Videos') return item.type === 'video';
    if (selectedCategory === 'Audio') return item.type === 'audio';

    const itemCat = (item.category || '').toLowerCase();
    const selCat = selectedCategory.toLowerCase();

    if (selCat.includes('workshop') && itemCat.includes('workshop')) return true;
    if (selCat.includes('hackathon') && itemCat.includes('hackathon')) return true;
    if (selCat.includes('community') && (itemCat.includes('community') || itemCat.includes('meetup'))) return true;

    return itemCat.includes(selCat);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 py-8">
      <div className="text-center space-y-3">
        <Badge variant="primary" className="gap-1.5 px-3 py-1 text-xs">
          <Sparkles className="w-3.5 h-3.5" /> MCC Multi-Media Gallery
        </Badge>
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Community Moments, Videos &amp; Audio Highlights
        </h1>
        <p className="text-sm text-slate-600 dark:text-[#A8B0BB] max-w-2xl mx-auto">
          Explore photo galleries, workshop video recordings (MP4/WebM), keynote audio streams (MP3/WAV), and hackathon moments.
        </p>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 text-xs font-bold rounded-full transition-all flex items-center gap-1.5 ${
              selectedCategory === cat
                ? 'bg-[#0078D4] dark:bg-[#00A4EF] text-white shadow-lg shadow-sky-500/20'
                : 'bg-slate-100 dark:bg-[#151B23] text-slate-700 dark:text-[#A8B0BB] hover:bg-slate-200 dark:hover:bg-[#1B222C] border border-slate-200 dark:border-[#2A323D]'
            }`}
          >
            {cat === 'Videos' && <Video className="w-3.5 h-3.5 text-rose-400" />}
            {cat === 'Audio' && <Music className="w-3.5 h-3.5 text-emerald-400" />}
            {cat !== 'Videos' && cat !== 'Audio' && <ImageIcon className="w-3.5 h-3.5 text-sky-400" />}
            {cat}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-[#00A4EF]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-500 dark:text-slate-400">
          No media items found in {selectedCategory} category.
        </div>
      ) : (
        /* Grid Display */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="relative rounded-2xl overflow-hidden group bg-white dark:bg-[#151B23] border border-slate-200 dark:border-[#2A323D] hover:border-sky-500/50 shadow-xl transition-all flex flex-col justify-between"
            >
              {/* VIDEO PLAYER */}
              {item.type === 'video' ? (
                <div className="relative bg-black rounded-2xl overflow-hidden flex-1 flex flex-col justify-between">
                  <div className="p-3 bg-gradient-to-r from-rose-900/80 to-slate-900 flex items-center justify-between border-b border-rose-500/30">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-300 flex items-center gap-1">
                      <Video className="w-3.5 h-3.5" /> Video (.MP4)
                    </span>
                    <Badge variant="danger" size="sm">HD Video</Badge>
                  </div>
                  <video
                    controls
                    preload="metadata"
                    playsInline
                    className="w-full aspect-video object-cover bg-black"
                  >
                    <source src={item.url} />
                    Your browser does not support video playback.
                  </video>
                  <div className="p-3 bg-slate-900/90">
                    <h4 className="text-xs font-bold text-white line-clamp-1">{item.title}</h4>
                    {item.albumTitle && <p className="text-[10px] text-slate-400">{item.albumTitle}</p>}
                  </div>
                </div>
              ) : item.type === 'audio' ? (
                /* AUDIO PLAYER CARD */
                <div className="p-5 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 rounded-2xl border border-emerald-500/30 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <Music className="w-4 h-4 text-emerald-400 animate-pulse" /> Audio Stream (.MP3)
                    </span>
                    <Badge variant="success" size="sm">Audio Stream</Badge>
                  </div>

                  <div>
                    <h4 className="text-sm font-extrabold text-white">{item.title}</h4>
                    {item.albumTitle && <p className="text-xs text-slate-400">{item.albumTitle}</p>}
                  </div>

                  {/* Audio Wave Visualizer Simulation */}
                  <div className="flex items-center gap-1 py-2 h-8">
                    {[40, 75, 30, 90, 60, 100, 45, 80, 20, 65, 85, 50, 95, 35, 70].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-emerald-500/60 rounded-full transition-all duration-300"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>

                  <audio controls className="w-full accent-emerald-500 rounded-lg">
                    <source src={item.url} />
                    Your browser does not support audio playback.
                  </audio>
                </div>
              ) : (
                /* IMAGE DISPLAY WITH LIGHTBOX */
                <div
                  onClick={() => setLightboxMedia(item)}
                  className="cursor-pointer group relative overflow-hidden rounded-2xl h-64 sm:h-72"
                >
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-2xl"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                    <Badge variant="primary" size="sm" className="w-fit mb-1">
                      {item.category}
                    </Badge>
                    <h4 className="text-xs font-bold text-white">{item.title}</h4>
                    {item.albumTitle && <p className="text-[10px] text-slate-300">{item.albumTitle}</p>}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal for Full View */}
      <Modal isOpen={!!lightboxMedia} onClose={() => setLightboxMedia(null)} maxWidth="4xl">
        {lightboxMedia && (
          <div className="space-y-4">
            {lightboxMedia.type === 'video' ? (
              <video controls autoPlay className="w-full max-h-[80vh] rounded-xl bg-black">
                <source src={lightboxMedia.url} />
              </video>
            ) : lightboxMedia.type === 'audio' ? (
              <div className="p-8 bg-slate-900 rounded-xl space-y-4 text-center">
                <Music className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
                <h3 className="text-xl font-bold text-white">{lightboxMedia.title}</h3>
                <audio controls autoPlay className="w-full">
                  <source src={lightboxMedia.url} />
                </audio>
              </div>
            ) : (
              <img
                src={lightboxMedia.url}
                alt={lightboxMedia.title}
                className="w-full max-h-[80vh] object-contain rounded-xl"
              />
            )}
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-white">{lightboxMedia.title}</span>
              <Badge variant="outline">{lightboxMedia.category}</Badge>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
