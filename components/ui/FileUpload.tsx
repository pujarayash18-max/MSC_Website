'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Upload, Loader2, CheckCircle2 } from 'lucide-react';
import type { BlobContainerName } from '@/lib/storage';

interface FileUploadProps {
  container: BlobContainerName;
  onUploadComplete: (url: string) => void;
  accept?: string;
  label?: string;
  currentUrl?: string;
}

export function FileUpload({
  container,
  onUploadComplete,
  accept = 'image/*,.pdf',
  label = 'Upload File',
  currentUrl,
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('container', container);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (res.ok && json.success) {
        onUploadComplete(json.data.url);
        toast.success(`Uploaded ${file.name} successfully!`);
      } else {
        toast.error(json.error || 'Upload failed.');
      }
    } catch {
      toast.error('Network error while uploading.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <input
          type="file"
          ref={fileInputRef}
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
        />

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
          className="gap-2 font-bold"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-[#00A4EF]" /> Uploading...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 text-[#00A4EF]" /> {label}
            </>
          )}
        </Button>

        {currentUrl && (
          <span className="text-xs text-emerald-500 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> File Ready
          </span>
        )}
      </div>
    </div>
  );
}
