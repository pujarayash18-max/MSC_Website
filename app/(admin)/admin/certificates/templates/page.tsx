'use client';

import { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Award, Upload, Play, CheckCircle2, Sliders, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import type { Event } from '@/types';

async function fetchEvents(): Promise<Event[]> {
  const res = await fetch('/api/events');
  if (!res.ok) return [];
  const json = await res.json();
  return json.data?.events || [];
}

export default function AdminCertificatesTemplatesPage() {
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['admin-events-for-templates'],
    queryFn: fetchEvents,
  });

  const [selectedEventId, setSelectedEventId] = useState('');
  const [certType, setCertType] = useState<'PARTICIPATION' | 'WINNER' | 'VOLUNTEER' | 'SPEAKER'>('PARTICIPATION');
  const [isGenerating, setIsGenerating] = useState(false);
  const [templateImage, setTemplateImage] = useState<string | null>(null);
  const [namePosition, setNamePosition] = useState({ x: 50, y: 45 });
  const [qrPosition, setQrPosition] = useState({ x: 85, y: 80 });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedEvent = events.find((e) => e.id === selectedEventId) || events[0];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      toast.error('Invalid file type! Please upload an image (.png, .jpg) or PDF template.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      setTemplateImage(evt.target?.result as string);
      toast.success(`Custom certificate background template uploaded: ${file.name}`);
    };
    reader.readAsDataURL(file);
  };

  const handleBatchGenerate = async () => {
    if (!selectedEvent) return;
    setIsGenerating(true);
    try {
      const res = await fetch('/api/certificates/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          templateName: `${selectedEvent.title} - ${certType}`,
          certificateType: certType,
          backgroundBlobUrl: templateImage || 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200',
          placeholders: [
            { field: 'studentName', x: namePosition.x, y: namePosition.y },
            { field: 'qrCode', x: qrPosition.x, y: qrPosition.y },
          ],
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        toast.success(`Certificate template saved for ${selectedEvent.title}! Batch generation ready.`);
      } else {
        toast.error(json.error || 'Failed to save template.');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#00A4EF]" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Award className="w-7 h-7 text-sky-400" /> Certificate Generator &amp; Template Editor
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Upload custom certificate background templates, configure placeholder positions, and trigger batch PDF generation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Template Editor Box */}
        <Card className="p-6 space-y-6 border-slate-200 dark:border-[#2A323D]">
          <div className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-sky-400" /> Canvas &amp; Placeholder Layout
            </h2>
            <p className="text-xs text-slate-500">Configure drag-and-drop placeholder coordinates for student name and verification QR code.</p>
          </div>

          <div
            className="relative h-64 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-[#0B0F14] flex flex-col items-center justify-center cursor-pointer overflow-hidden group shadow-inner"
            onClick={(e) => {
              if (!templateImage) {
                fileInputRef.current?.click();
                return;
              }
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = Math.round(((e.clientX - rect.left) / rect.width) * 100);
              const clickY = Math.round(((e.clientY - rect.top) / rect.height) * 100);
              setNamePosition({ x: clickX, y: clickY });
              toast.info(`Updated Student Name position to X:${clickX}%, Y:${clickY}%`);
            }}
          >
            {templateImage ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={templateImage} alt="Template Background" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center p-6 space-y-2">
                <Upload className="w-8 h-8 text-sky-400 mx-auto group-hover:scale-110 transition-transform" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Click to Upload Template Image (.PNG / .JPG)</p>
                <p className="text-[10px] text-slate-500">Recommended resolution: 1920x1080px landscape canvas</p>
              </div>
            )}

            {/* Overlay Simulated Placeholders */}
            {templateImage && (
              <>
                <div
                  className="absolute p-2 bg-sky-500/80 text-white rounded text-[10px] font-bold shadow-lg"
                  style={{ top: `${namePosition.y}%`, left: `${namePosition.x}%`, transform: 'translate(-50%, -50%)' }}
                >
                  [Student Name]
                </div>
                <div
                  className="absolute p-2 bg-emerald-500/80 text-white rounded text-[10px] font-bold shadow-lg"
                  style={{ top: `${qrPosition.y}%`, left: `${qrPosition.x}%`, transform: 'translate(-50%, -50%)' }}
                >
                  [QR Verification]
                </div>
              </>
            )}
          </div>

          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*,application/pdf" className="hidden" />

          {/* Coordinate Sliders */}
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Student Name Vertical Position (Y-Axis)</span>
                <span className="font-mono text-sky-400">{namePosition.y}%</span>
              </label>
              <input
                type="range"
                min={10}
                max={90}
                value={namePosition.y}
                onChange={(e) => setNamePosition((prev) => ({ ...prev, y: parseInt(e.target.value) }))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Verification QR Position (Y-Axis)</span>
                <span className="font-mono text-emerald-400">{qrPosition.y}%</span>
              </label>
              <input
                type="range"
                min={10}
                max={90}
                value={qrPosition.y}
                onChange={(e) => setQrPosition((prev) => ({ ...prev, y: parseInt(e.target.value) }))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>
          </div>
        </Card>

        {/* Batch Generation Control Box */}
        <Card className="p-6 space-y-6 border-slate-200 dark:border-[#2A323D]">
          <div className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Play className="w-4 h-4 text-emerald-400" /> Target Event &amp; Issuance Settings
            </h2>
            <p className="text-xs text-slate-500">Select event and certificate type to trigger batch PDF rendering and email dispatch.</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Select Target Event *</label>
              <select
                value={selectedEventId || (events[0]?.id ?? '')}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full p-3 text-xs bg-slate-50 dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
              >
                {events.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.title} ({new Date(e.startDate).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Certificate Type *</label>
              <select
                value={certType}
                onChange={(e) => setCertType(e.target.value as 'PARTICIPATION' | 'WINNER' | 'VOLUNTEER' | 'SPEAKER')}
                className="w-full p-3 text-xs bg-slate-50 dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
              >
                <option value="PARTICIPATION">Participation Certificate</option>
                <option value="WINNER">Winner / Excellence Certificate</option>
                <option value="VOLUNTEER">Volunteer Appreciation Certificate</option>
                <option value="SPEAKER">Guest Speaker Honor Certificate</option>
              </select>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] space-y-2 text-xs">
              <span className="font-bold text-slate-900 dark:text-white block">Issuance Preview Summary:</span>
              <p className="text-slate-500">• Target Event: {selectedEvent?.title || 'Selected Event'}</p>
              <p className="text-slate-500">• Output Format: High-resolution PDF with embedded QR</p>
            </div>

            <Button
              variant="fluent"
              size="lg"
              disabled={isGenerating}
              onClick={handleBatchGenerate}
              className="w-full font-bold justify-center"
            >
              {isGenerating ? (
                <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Saving Template &amp; Generating PDFs...</span>
              ) : (
                <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Save Template &amp; Issue Certificates</span>
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
