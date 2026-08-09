'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';

const INITIAL_GALLERY = [
  { id: '1', title: 'Azure AI Masterclass Keynote', category: 'Events', url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80' },
  { id: '2', title: 'National Hackathon Coding Arena', category: 'Hackathons', url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&q=80' },
  { id: '3', title: 'Hands-on Azure Lab Workshop', category: 'Workshops', url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80' },
  { id: '4', title: 'Core Team Strategy Meeting 2026', category: 'Community', url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80' },
  { id: '5', title: 'Azure Serverless Code Jam', category: 'Workshops', url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80' },
  { id: '6', title: 'Hackathon Award Ceremony', category: 'Hackathons', url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80' }
];

export default function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const categories = ['All', 'Events', 'Hackathons', 'Workshops', 'Community'];
  const filtered = selectedCategory === 'All' ? INITIAL_GALLERY : INITIAL_GALLERY.filter((item) => item.category === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 py-8">
      <div className="text-center space-y-3">
        <Badge variant="primary">MCC Media Gallery</Badge>
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">Community Moments & Event Highlights</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">Glimpses from keynotes, national hackathons, technical workshops, and core team meetups.</p>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 text-xs font-semibold rounded-full transition-all ${
              selectedCategory === cat ? 'bg-[#00A4EF] text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-white'
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
            className="break-inside-avoid relative rounded-2xl overflow-hidden group cursor-pointer border border-slate-200 dark:border-slate-800 hover:border-sky-500/50 shadow-xl transition-all"
          >
            <Image src={item.url} alt={item.title} width={600} height={400} className="w-full object-cover group-hover:scale-105 transition-transform duration-500" />
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
          <Image src={previewImage} alt="Preview" width={1200} height={800} className="w-full max-h-[80vh] object-contain rounded-xl" />
        )}
      </Modal>
    </div>
  );
}
