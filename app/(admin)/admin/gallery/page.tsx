'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Image as ImageIcon, Upload } from 'lucide-react';

export default function AdminGalleryPage() {
  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <ImageIcon className="w-7 h-7 text-sky-400" /> Gallery & Media Manager
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Upload workshop photos, hackathon highlights, and manage photo albums.
          </p>
        </div>

        <Button variant="fluent" size="sm" onClick={() => toast.success('Media upload modal opened!')}>
          <Upload className="w-4 h-4" /> Upload Photos / Videos
        </Button>
      </div>

      <Card className="p-8 text-center space-y-4 border-dashed border-sky-500/40">
        <Upload className="w-12 h-12 text-sky-400 mx-auto" />
        <div>
          <h3 className="text-base font-bold text-white">Drag and Drop Event Photos & Videos</h3>
          <p className="text-xs text-slate-400 mt-1">Supports JPG, PNG, MP4 uploads up to 50MB per file.</p>
        </div>
        <Button variant="fluent" size="sm" className="mx-auto" onClick={() => toast.success('Photo uploaded!')}>
          Select Files from Local Disk
        </Button>
      </Card>
    </div>
  );
}
