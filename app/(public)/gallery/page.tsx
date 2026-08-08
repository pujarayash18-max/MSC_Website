'use client';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Image, Video, Eye, Sparkles } from 'lucide-react';

const MOCK_GALLERY = [
  { id: 'g1', title: 'Azure Workshop Live Demo', type: 'image', category: 'Workshops', url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80' },
  { id: 'g2', title: 'National Hackathon Opening Ceremony', type: 'image', category: 'Hackathons', url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80' },
  { id: 'g3', title: 'Core Team Strategy Meeting', type: 'image', category: 'Behind the Scenes', url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80' },
  { id: 'g4', title: 'Certificate Distribution Ceremony', type: 'image', category: 'Conferences', url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80' },
  { id: 'g5', title: 'GitHub Open Source Hackathon Winners', type: 'image', category: 'Hackathons', url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80' }
];

const CATEGORIES = ['All Albums', 'Workshops', 'Hackathons', 'Behind the Scenes', 'Conferences'];

export default function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState('All Albums');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const filtered = MOCK_GALLERY.filter(
    (g) => selectedCategory === 'All Albums' || g.category === selectedCategory
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 py-8">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <Badge variant="primary">Event Media (§28)</Badge>
        <h1 className="text-4xl font-extrabold text-white">Community Photo & Video Gallery</h1>
        <p className="text-sm text-slate-400">Highlights from past Azure bootcamps, hackathons, and student meetups at Marwadi University.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1.5 text-xs font-semibold rounded-xl transition-all ${
              selectedCategory === cat
                ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/25'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Masonry Grid */}
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
        {filtered.map((item) => (
          <div
            key={item.id}
            onClick={() => setPreviewImage(item.url)}
            className="break-inside-avoid relative rounded-2xl overflow-hidden group cursor-pointer border border-slate-800 hover:border-sky-500/50 shadow-xl transition-all"
          >
            <img src={item.url} alt={item.title} className="w-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
              <Badge variant="primary" size="sm" className="w-fit mb-1">{item.category}</Badge>
              <h4 className="text-xs font-bold text-white">{item.title}</h4>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      <Modal isOpen={!!previewImage} onClose={() => setPreviewImage(null)} maxWidth="4xl">
        {previewImage && (
          <img src={previewImage} alt="Preview" className="w-full max-h-[80vh] object-contain rounded-xl" />
        )}
      </Modal>
    </div>
  );
}
