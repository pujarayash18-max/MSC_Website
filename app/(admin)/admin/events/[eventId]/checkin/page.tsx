'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { QrCode, ArrowLeft, CheckCircle2, AlertCircle, Camera, Loader2 } from 'lucide-react';
import type { Event } from '@/types';

interface CheckinPageProps {
  params: Promise<{ eventId: string }>;
}

export default function EventCheckinPage({ params }: CheckinPageProps) {
  const resolvedParams = use(params);
  const eventId = resolvedParams.eventId;

  const [event, setEvent] = useState<Event | null>(null);
  const [manualToken, setManualToken] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastScanResult, setLastScanResult] = useState<{
    studentName: string;
    studentId: string;
    message: string;
    alreadyCheckedIn: boolean;
  } | null>(null);

  useEffect(() => {
    fetch(`/api/events/${encodeURIComponent(eventId)}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data?.event) {
          setEvent(json.data.event);
        }
      })
      .catch(() => {});
  }, [eventId]);

  const processScan = async (qrToken: string) => {
    if (!qrToken || isProcessing) return;
    setIsProcessing(true);

    try {
      const res = await fetch('/api/attendance/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ eventId, qrToken }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        const studentName = json.data?.student?.fullName || 'Student';
        const studentId = json.data?.student?.studentId || '';
        const alreadyCheckedIn = json.data?.alreadyCheckedIn || false;

        setLastScanResult({
          studentName,
          studentId,
          message: json.data?.message || 'Check-in recorded.',
          alreadyCheckedIn,
        });

        if (alreadyCheckedIn) {
          toast.warning(json.data.message);
        } else {
          toast.success(json.data.message);
        }
        setManualToken('');
      } else {
        toast.error(json.error || 'Check-in failed.');
      }
    } catch {
      toast.error('Network error while processing scan.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processScan(manualToken.trim());
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/admin/events">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4" /> Back to Events
          </Button>
        </Link>

        {event && (
          <Badge variant="primary" className="text-xs">
            {event.title}
          </Badge>
        )}
      </div>

      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <QrCode className="w-7 h-7 text-[#00A4EF]" /> Live Event Scanner &amp; Check-in Desk
        </h1>
        <p className="text-sm text-slate-600 dark:text-[#A8B0BB] mt-1">
          Scan student entry pass QR codes using device camera or enter pass token manually.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Scanner Card */}
        <Card className="p-6 space-y-4 border-slate-200 dark:border-[#2A323D] bg-white dark:bg-[#151B23]">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Camera className="w-4 h-4 text-[#00A4EF]" /> Camera Scanner
          </h2>

          <div className="h-56 rounded-2xl bg-slate-100 dark:bg-[#0B0F14] border-2 border-dashed border-slate-300 dark:border-[#2A323D] flex flex-col items-center justify-center p-4 text-center">
            {isScanning ? (
              <div className="space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-[#00A4EF] mx-auto" />
                <p className="text-xs font-semibold text-slate-600 dark:text-[#A8B0BB]">Camera active. Point at student QR badge...</p>
                <Button variant="outline" size="sm" onClick={() => setIsScanning(false)}>
                  Stop Camera
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <QrCode className="w-12 h-12 text-[#00A4EF] mx-auto opacity-80" />
                <p className="text-xs text-slate-500">Scan QR codes directly using device webcam/camera.</p>
                <Button variant="fluent" size="sm" onClick={() => setIsScanning(true)}>
                  Activate Scanner
                </Button>
              </div>
            )}
          </div>

          <form onSubmit={handleManualSubmit} className="space-y-2 pt-2 border-t border-slate-200 dark:border-[#2A323D]">
            <label className="text-xs font-bold block text-slate-700 dark:text-slate-300">Manual Pass Code Entry</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                placeholder="Enter QR token (e.g. MCC-PASS-8801)"
                className="flex-1 p-2.5 text-xs bg-slate-50 dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:outline-none"
              />
              <Button type="submit" variant="fluent" size="sm" disabled={isProcessing || !manualToken.trim()}>
                {isProcessing ? 'Verifying...' : 'Submit'}
              </Button>
            </div>
          </form>
        </Card>

        {/* Scan Result Feedback Card */}
        <Card className="p-6 space-y-4 border-slate-200 dark:border-[#2A323D] bg-white dark:bg-[#151B23]">
          <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-[#2A323D] pb-3">
            Last Verified Check-in
          </h2>

          {lastScanResult ? (
            <div className={`p-5 rounded-2xl border text-center space-y-3 ${lastScanResult.alreadyCheckedIn ? 'bg-amber-500/10 border-amber-500/30' : 'bg-emerald-500/10 border-emerald-500/30'}`}>
              {lastScanResult.alreadyCheckedIn ? (
                <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
              ) : (
                <CheckCircle2 className="w-10 h-10 text-[#7FBA00] mx-auto animate-bounce" />
              )}

              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">{lastScanResult.studentName}</h3>
                <p className="text-xs font-mono text-slate-500">{lastScanResult.studentId}</p>
              </div>

              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{lastScanResult.message}</p>
            </div>
          ) : (
            <div className="py-16 text-center text-slate-500 text-xs">
              No scans performed in this session yet. Scan a QR code to verify student entry.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
