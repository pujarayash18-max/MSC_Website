'use client';

import { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Award, Upload, Play, CheckCircle2, Sliders, Loader2, RotateCcw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { FileUpload } from '@/components/ui/FileUpload';
import type { Event } from '@/types';

const DEFAULT_CERTIFICATE_BG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675">
  <rect width="1200" height="675" fill="#0F172A"/>
  <rect x="24" y="24" width="1152" height="627" fill="none" stroke="#00A4EF" stroke-width="4" rx="16"/>
  <rect x="40" y="40" width="1120" height="595" fill="none" stroke="#0078D4" stroke-width="1.5" opacity="0.4" rx="12"/>
  <circle cx="120" cy="120" r="150" fill="#00A4EF" opacity="0.08"/>
  <circle cx="1080" cy="555" r="170" fill="#7C3AED" opacity="0.08"/>
  <text x="600" y="110" font-family="system-ui, sans-serif" font-size="24" font-weight="800" fill="#00A4EF" text-anchor="middle" letter-spacing="4">MARWADI UNIVERSITY • MICROSOFT CAMPUS CLUB</text>
  <text x="600" y="185" font-family="Georgia, serif" font-size="46" font-weight="bold" fill="#FFFFFF" text-anchor="middle" letter-spacing="2">CERTIFICATE OF APPRECIATION</text>
  <text x="600" y="235" font-family="system-ui, sans-serif" font-size="15" fill="#94A3B8" text-anchor="middle" letter-spacing="1">THIS IS PROUDLY PRESENTED TO</text>
  <line x1="300" y1="365" x2="900" y2="365" stroke="#00A4EF" stroke-width="2" opacity="0.6"/>
  <text x="600" y="415" font-family="system-ui, sans-serif" font-size="15" fill="#94A3B8" text-anchor="middle">FOR OUTSTANDING PARTICIPATION AND ACHIEVEMENT IN THE OFFICIAL EVENT</text>
  <text x="220" y="585" font-family="system-ui, sans-serif" font-size="14" fill="#64748B" font-weight="600">FACULTY CONVENER</text>
  <line x1="160" y1="555" x2="360" y2="555" stroke="#475569" stroke-width="1.5"/>
  <text x="980" y="585" font-family="system-ui, sans-serif" font-size="14" fill="#64748B" font-weight="600">CLUB PRESIDENT</text>
  <line x1="920" y1="555" x2="1120" y2="555" stroke="#475569" stroke-width="1.5"/>
</svg>
`)}`;

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
  const [issueAudience, setIssueAudience] = useState<'ATTENDED_ONLY' | 'ALL_REGISTERED'>('ATTENDED_ONLY');
  const [isGenerating, setIsGenerating] = useState(false);
  const [templateImage, setTemplateImage] = useState<string>(DEFAULT_CERTIFICATE_BG);
  const [namePosition, setNamePosition] = useState({ x: 50, y: 45 });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedEvent = events.find((e) => e.id === selectedEventId) || events[0];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      toast.error('Invalid file type! Please upload an image (.png, .jpg, .svg) or PDF template.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      if (evt.target?.result) {
        setTemplateImage(evt.target.result as string);
        toast.success(`Custom ${file.type === 'application/pdf' ? 'PDF' : 'Image'} certificate template loaded: ${file.name}`);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleBatchGenerate = async () => {
    if (!selectedEvent) {
      toast.error('Please select a target event first.');
      return;
    }
    setIsGenerating(true);
    try {
      const targetEventId = selectedEvent?.id || selectedEventId;
      const res = await fetch('/api/certificates/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          templateName: `${selectedEvent?.title || 'Event'} - ${certType}`,
          certificateType: certType,
          backgroundBlobUrl: templateImage || DEFAULT_CERTIFICATE_BG,
          eventId: targetEventId,
          issueAudience,
          placeholders: [
            { field: 'studentName', x: namePosition.x, y: namePosition.y },
          ],
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        toast.success(
          `Template saved! ${json.data.issuedCount || 0} certificate(s) issued for ${
            issueAudience === 'ATTENDED_ONLY' ? 'marked attendees' : 'all registrants'
          }.`
        );
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
            <p className="text-xs text-slate-500">Click anywhere on canvas to position student name, or use slider controls below.</p>
          </div>

          {/* Canvas Preview Box */}
          {(() => {
            const isPdfTemplate = Boolean(
              templateImage &&
                (templateImage.startsWith('data:application/pdf') ||
                  templateImage.toLowerCase().split('?')[0].endsWith('.pdf'))
            );
            return (
              <div
                className="relative w-full aspect-[841.89/595.28] max-h-[420px] rounded-2xl border-2 border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-[#0B0F14] flex flex-col items-center justify-center cursor-pointer overflow-hidden group shadow-inner"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = Math.round(((e.clientX - rect.left) / rect.width) * 100);
                  const clickY = Math.round(((e.clientY - rect.top) / rect.height) * 100);
                  setNamePosition({ x: clickX, y: clickY });
                  toast.info(`Updated Student Name position to X:${clickX}%, Y:${clickY}%`);
                }}
              >
                {isPdfTemplate ? (
                  <iframe
                    src={`${templateImage}#toolbar=0&navpanes=0&scrollbar=0`}
                    title="Certificate PDF Template Preview"
                    className="w-full h-full border-0 pointer-events-none rounded-2xl bg-white"
                  />
                ) : (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={templateImage || DEFAULT_CERTIFICATE_BG}
                    alt="Template Background"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = DEFAULT_CERTIFICATE_BG;
                    }}
                  />
                )}

                {/* Overlay Placeholders */}
                <div
                  className="absolute p-2 bg-sky-500/90 text-white rounded text-[11px] font-bold shadow-lg border border-white/20 select-none z-10"
                  style={{ top: `${namePosition.y}%`, left: `${namePosition.x}%`, transform: 'translate(-50%, -50%)' }}
                >
                  [Student Name]
                </div>
              </div>
            );
          })()}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            <FileUpload
              container="certificates"
              label="Upload Custom Template (PDF / PNG / JPG)"
              accept="image/*,application/pdf,.pdf"
              onUploadComplete={(url) => {
                setTemplateImage(url);
                toast.success('Certificate background template uploaded successfully!');
              }}
              currentUrl={templateImage !== DEFAULT_CERTIFICATE_BG ? templateImage : undefined}
            />

            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*,application/pdf,.pdf" className="hidden" />

            <div className="flex items-center gap-2 shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="gap-1.5 text-xs"
              >
                <Upload className="w-3.5 h-3.5 text-sky-400" /> Local File
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setTemplateImage(DEFAULT_CERTIFICATE_BG);
                  toast.info('Reset background to default MCC certificate template canvas.');
                }}
                className="gap-1.5 text-xs text-slate-400"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset Canvas
              </Button>
            </div>
          </div>

          {/* Coordinate Sliders */}
          <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-[#2A323D]">
            {/* Student Name Sliders */}
            <div className="p-3.5 rounded-xl bg-sky-500/5 border border-sky-500/20 space-y-3">
              <span className="text-xs font-bold text-sky-400 block">Student Name Position (X & Y Axis)</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 flex items-center justify-between">
                    <span>Horizontal (X-Axis)</span>
                    <span className="font-mono text-sky-400">{namePosition.x}%</span>
                  </label>
                  <input
                    type="range"
                    min={5}
                    max={95}
                    value={namePosition.x}
                    onChange={(e) => setNamePosition((prev) => ({ ...prev, x: parseInt(e.target.value) }))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 flex items-center justify-between">
                    <span>Vertical (Y-Axis)</span>
                    <span className="font-mono text-sky-400">{namePosition.y}%</span>
                  </label>
                  <input
                    type="range"
                    min={5}
                    max={95}
                    value={namePosition.y}
                    onChange={(e) => setNamePosition((prev) => ({ ...prev, y: parseInt(e.target.value) }))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                  />
                </div>
              </div>
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

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Recipient Target Audience *</label>
              <select
                value={issueAudience}
                onChange={(e) => setIssueAudience(e.target.value as 'ATTENDED_ONLY' | 'ALL_REGISTERED')}
                className="w-full p-3 text-xs bg-slate-50 dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
              >
                <option value="ATTENDED_ONLY">✓ Marked Attendance Only (PRESENT) — Recommended</option>
                <option value="ALL_REGISTERED">All Event Registrants (CONFIRMED)</option>
              </select>
              <p className="text-[11px] text-emerald-500 font-medium pt-0.5">
                {issueAudience === 'ATTENDED_ONLY'
                  ? '🔒 Certificates will strictly be generated and sent only to students whose attendance is marked as PRESENT.'
                  : '⚠️ Certificates will be generated for all confirmed event registrants.'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] space-y-2 text-xs">
              <span className="font-bold text-slate-900 dark:text-white block">Issuance Preview Summary:</span>
              <p className="text-slate-500">• Target Event: {selectedEvent?.title || 'Selected Event'}</p>
              <p className="text-slate-500">
                • Target Audience:{' '}
                <span className="text-emerald-400 font-semibold">
                  {issueAudience === 'ATTENDED_ONLY' ? 'Marked Attendance Only (PRESENT)' : 'All Registrants'}
                </span>
              </p>
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
