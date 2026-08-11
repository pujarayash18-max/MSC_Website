'use client';
import { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { INITIAL_EVENTS } from '@/lib/services/dataService';
import { toast } from 'sonner';
import { Award, Upload, Play, CheckCircle2, Sliders } from 'lucide-react';

import { dynamicDb } from '@/lib/services/dataService';

export default function AdminCertificatesTemplatesPage() {
  const [selectedEventId, setSelectedEventId] = useState(INITIAL_EVENTS[0].eventId);
  const [certType, setCertType] = useState<'Participation' | 'Winner' | 'Volunteer' | 'Speaker'>('Participation');
  const [isGenerating, setIsGenerating] = useState(false);
  const [templateImage, setTemplateImage] = useState<string | null>(null);
  const [namePosition, setNamePosition] = useState({ x: 50, y: 45 });
  const [qrPosition, setQrPosition] = useState({ x: 85, y: 80 });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedEvent = INITIAL_EVENTS.find((e) => e.eventId === selectedEventId) || INITIAL_EVENTS[0];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      toast.error('Invalid file type! Please upload an image (.png, .jpg) or PDF template.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setTemplateImage(event.target?.result as string);
      toast.success(`Custom certificate background template uploaded: ${file.name}`);
    };
    reader.readAsDataURL(file);
  };

  const handleBatchGenerate = async () => {
    setIsGenerating(true);
    try {
      await new Promise((res) => setTimeout(res, 600));

      const verId = `MCC-CERT-${Date.now().toString().slice(-6)}`;
      dynamicDb.saveCertificate({
        verificationId: verId,
        studentName: 'Rahul Sharma',
        studentId: 'MCC-2026-00042',
        enrollmentNumber: '92100103045',
        eventName: selectedEvent.title,
        eventType: `${certType} Certificate`,
        issueDate: new Date().toISOString().split('T')[0],
        status: 'Verified',
        issuer: 'Microsoft Campus Club (MCC) — Marwadi University'
      });

      toast.success(`Batch generated and delivered ${certType} certificates for ${selectedEvent.title}! (Ref: ${verId})`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <Award className="w-7 h-7 text-sky-400" /> Certificate Generator & Template Editor
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Upload custom certificate background templates, configure placeholder positions, and trigger batch PDF generation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Template Editor Box */}
        <Card className="p-6 space-y-5 border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Upload className="w-4 h-4 text-sky-400" /> Upload Template Background
            </h3>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/png,image/jpeg,image/jpg,application/pdf"
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="text-sky-400 border-sky-500/40 hover:bg-sky-500/10"
            >
              <Upload className="w-3.5 h-3.5" /> Upload File
            </Button>
          </div>

          {/* Interactive Certificate Canvas Preview */}
          <div
            className="h-56 rounded-2xl border-2 border-dashed border-sky-500/40 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden bg-cover bg-center"
            style={{
              backgroundImage: templateImage ? `url(${templateImage})` : undefined,
              backgroundColor: templateImage ? undefined : '#0F172A'
            }}
          >
            {templateImage && <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[1px]" />}

            <div className="space-y-1 relative z-10">
              <Award className="w-10 h-10 text-amber-400 mx-auto opacity-90 animate-pulse" />
              <p
                className="text-xs font-extrabold text-white uppercase tracking-widest bg-slate-950/80 px-3 py-1 rounded-lg border border-sky-500/40 inline-block"
                style={{ position: 'relative', top: `${namePosition.y - 45}px` }}
              >
                [STUDENT NAME PLACEHOLDER]
              </p>
              <p className="text-[10px] text-slate-300 font-semibold">{selectedEvent.title}</p>
              <div className="pt-2 flex justify-center gap-2">
                <Badge variant="primary" size="sm">
                  Name (X: {namePosition.x}%, Y: {namePosition.y}%)
                </Badge>
                <Badge variant="purple" size="sm">
                  QR Code (X: {qrPosition.x}%, Y: {qrPosition.y}%)
                </Badge>
              </div>
            </div>

            {templateImage && (
              <Badge variant="success" className="absolute top-3 right-3 text-[10px] z-10">
                <CheckCircle2 className="w-3 h-3" /> Custom Template Loaded
              </Badge>
            )}
          </div>

          {/* Position Adjuster Controls */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
              <Sliders className="w-3.5 h-3.5 text-sky-400" /> Adjust Placeholder Offsets
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Name Y-Offset ({namePosition.y}%)</label>
                <input
                  type="range"
                  min="20"
                  max="80"
                  value={namePosition.y}
                  onChange={(e) => setNamePosition({ ...namePosition, y: Number(e.target.value) })}
                  className="w-full accent-sky-500 bg-slate-800"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">QR Code Y-Offset ({qrPosition.y}%)</label>
                <input
                  type="range"
                  min="50"
                  max="95"
                  value={qrPosition.y}
                  onChange={(e) => setQrPosition({ ...qrPosition, y: Number(e.target.value) })}
                  className="w-full accent-purple-500 bg-slate-800"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Batch Generator Control */}
        <Card className="p-6 space-y-5 border-sky-500/30">
          <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
            <Play className="w-4 h-4 text-emerald-400" /> Batch Certificate Generator
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Target Event</label>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-sky-500"
              >
                {INITIAL_EVENTS.map((e) => (
                  <option key={e.eventId} value={e.eventId}>
                    {e.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Certificate Type</label>
              <select
                value={certType}
                onChange={(e) => setCertType(e.target.value as 'Participation' | 'Winner' | 'Volunteer' | 'Speaker')}
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-sky-500"
              >
                <option value="Participation">Participation Certificate</option>
                <option value="Winner">Winner Certificate</option>
                <option value="Volunteer">Volunteer Certificate</option>
                <option value="Speaker">Speaker Appreciation Certificate</option>
              </select>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
            <span className="text-slate-400 font-medium">Eligible Checked-in Students:</span>
            <p className="text-base font-extrabold text-emerald-400">142 Students</p>
          </div>

          <Button variant="fluent" size="lg" className="w-full" onClick={handleBatchGenerate} isLoading={isGenerating}>
            <Award className="w-4 h-4" /> Batch Generate & Deliver PDFs
          </Button>
        </Card>
      </div>
    </div>
  );
}
