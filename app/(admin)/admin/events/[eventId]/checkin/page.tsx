'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { QrCode, ArrowLeft, CheckCircle2, AlertCircle, Camera, Loader2, Upload, Video } from 'lucide-react';
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
  const [isUploadingCsv, setIsUploadingCsv] = useState(false);
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
        toast.error(json.error || json.message || 'Check-in failed.');
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

  const [csvEvaluationResult, setCsvEvaluationResult] = useState<{
    meetingDurationMinutes: number;
    requiredThresholdMinutes: number;
    totalEvaluated: number;
    passedCount: number;
    disqualifiedCount: number;
    newlyApprovedCount: number;
    passedStudents: { email: string; fullName: string; duration: number }[];
    disqualifiedStudents: { email: string; fullName: string; duration: number }[];
    message: string;
  } | null>(null);

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const formData = new FormData();
    formData.append('eventId', eventId);
    formData.append('file', file);

    setIsUploadingCsv(true);
    try {
      const res = await fetch('/api/attendance/teams-csv-import', {
        method: 'POST',
        body: formData,
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setCsvEvaluationResult(json.data);
        toast.success(json.data?.message || 'MS Teams Attendance CSV processed successfully.');
      } else {
        toast.error(json.error || json.message || 'CSV Import failed.');
      }
    } catch {
      toast.error('Network error while uploading MS Teams CSV.');
    } finally {
      setIsUploadingCsv(false);
    }
  };

  const isOnlineEvent = event
    ? (String(event.mode || '').toUpperCase() === 'ONLINE' ||
       String(event.mode || '').toUpperCase() === 'HYBRID' ||
       String(event.venue || '').toLowerCase().startsWith('http') ||
       String(event.venue || '').toLowerCase().includes('teams') ||
       String(event.venue || '').toLowerCase().includes('zoom'))
    : false;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Header & Navigation */}
      <div className="flex items-center justify-between">
        <Link href="/admin/events">
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-slate-600 dark:text-[#A8B0BB]">
            <ArrowLeft className="w-4 h-4" /> Back to Events
          </Button>
        </Link>
        <Badge variant={event?.mode === 'ONLINE' || event?.mode === 'Online' ? 'success' : 'primary'} className="uppercase font-bold">
          {event?.mode || 'Offline'} Event
        </Badge>
      </div>

      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <QrCode className="w-7 h-7 text-[#00A4EF]" /> Event Attendance Management
        </h1>
        <p className="text-sm text-slate-600 dark:text-[#A8B0BB] mt-1">
          Scan QR codes for physical offline check-ins, or process Microsoft Teams Attendance Reports with 50%+ duration verification for online sessions.
        </p>
      </div>

      {/* MS Teams CSV Import Bar for Online / Hybrid Events */}
      {isOnlineEvent ? (
        <Card className="p-5 border-indigo-500/30 bg-indigo-950/20 dark:bg-[#111328] space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#5B5FC7]/20 text-[#5B5FC7]">
                <Video className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Microsoft Teams Attendance Verification (50%+ Rule)</h3>
                <p className="text-xs text-slate-500 dark:text-[#A8B0BB]">Upload MS Teams meeting report CSV. Students who attended &gt;= 50% of duration will be marked PRESENT (+50 Points).</p>
              </div>
            </div>

            <label className="cursor-pointer shrink-0">
              <input type="file" accept=".csv" onChange={handleCsvUpload} className="hidden" disabled={isUploadingCsv} />
              <Button variant="fluent" size="sm" className="bg-[#5B5FC7] hover:bg-[#464775] text-white gap-1.5 font-bold" disabled={isUploadingCsv}>
                {isUploadingCsv ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {isUploadingCsv ? 'Evaluating 50% Rule...' : 'Import & Evaluate MS Teams CSV'}
              </Button>
            </label>
          </div>
        </Card>
      ) : (
        <Card className="p-4 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-500 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Video className="w-4 h-4 text-slate-400" />
            <span>MS Teams CSV attendance verification is disabled because this is an <strong>In-Person (Offline)</strong> event. Use QR Check-in below.</span>
          </div>
        </Card>
      )}

      {/* MS Teams CSV Evaluation Result Breakdown */}
      {csvEvaluationResult && (
        <Card className="p-6 border-indigo-500/30 bg-slate-900/90 text-white space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#7FBA00]" /> MS Teams Duration Evaluation Report
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Meeting Duration: <strong className="text-indigo-300">{csvEvaluationResult.meetingDurationMinutes}m</strong> • Required Threshold (50%): <strong className="text-amber-300">{csvEvaluationResult.requiredThresholdMinutes}m minimum</strong>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="success" className="px-3 py-1 font-bold">{csvEvaluationResult.passedCount} Passed (&gt;=50%)</Badge>
              <Badge variant="danger" className="px-3 py-1 font-bold">{csvEvaluationResult.disqualifiedCount} Disqualified (&lt;50%)</Badge>
            </div>
          </div>

          <p className="text-xs text-slate-300 bg-slate-800/60 p-3 rounded-xl border border-slate-700 font-mono">
            {csvEvaluationResult.message}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Passed Students Column */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-[#7FBA00] uppercase tracking-wider">Passed Students (&gt;= 50% Duration)</h3>
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {csvEvaluationResult.passedStudents.map((s, idx) => (
                  <div key={idx} className="p-2 rounded-lg bg-slate-800/80 border border-emerald-500/20 text-xs flex justify-between items-center">
                    <div>
                      <span className="font-bold text-white block">{s.fullName}</span>
                      <span className="text-[10px] text-slate-400">{s.email}</span>
                    </div>
                    <Badge variant="success" className="text-[10px]">{s.duration}m attended</Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Disqualified Students Column */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-rose-400 uppercase tracking-wider">Disqualified Students (&lt; 50% Duration)</h3>
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {csvEvaluationResult.disqualifiedStudents.length === 0 ? (
                  <p className="text-xs text-slate-500 italic p-2">No students disqualified.</p>
                ) : (
                  csvEvaluationResult.disqualifiedStudents.map((s, idx) => (
                    <div key={idx} className="p-2 rounded-lg bg-slate-800/80 border border-rose-500/20 text-xs flex justify-between items-center">
                      <div>
                        <span className="font-bold text-white block">{s.fullName}</span>
                        <span className="text-[10px] text-slate-400">{s.email}</span>
                      </div>
                      <Badge variant="danger" className="text-[10px]">{s.duration}m / req {csvEvaluationResult.requiredThresholdMinutes}m</Badge>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Scanner Card */}
        <Card className="p-6 space-y-4 border-slate-200 dark:border-[#2A323D] bg-white dark:bg-[#151B23]">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Camera className="w-4 h-4 text-[#00A4EF]" /> Offline Physical Camera Scanner
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
              No scans performed in this session yet. Scan a QR code or import MS Teams CSV report to mark attendance.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
