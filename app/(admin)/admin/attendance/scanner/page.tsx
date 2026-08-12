'use client';

import { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { QrCode, Camera, CheckCircle2, User, RefreshCw, AlertTriangle, Loader2, UploadCloud, FileSpreadsheet, XCircle, Clock, Layers, Sparkles } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

async function fetchEvents() {
  const res = await fetch('/api/events');
  if (!res.ok) return [];
  const json = await res.json();
  return json.data?.events || [];
}

export default function AdminAttendanceScannerPage() {
  const { data: events = [] } = useQuery({ queryKey: ['admin-scanner-events'], queryFn: fetchEvents });
  const [selectedEventId, setSelectedEventId] = useState('');
  const [activeTab, setActiveTab] = useState<'QR' | 'CSV'>('QR');

  // In-Person QR State
  const [manualQr, setManualQr] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [scannedRecords, setScannedRecords] = useState<Array<{ name: string; time: string; status: string; id: string }>>([]);
  const [isScanning, setIsScanning] = useState(false);

  // Online Meeting CSV State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploadingCsv, setIsUploadingCsv] = useState(false);
  const [csvResult, setCsvResult] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isOnlineEvent = (evt: any) => {
    if (!evt) return false;
    const m = String(evt.mode || '').toUpperCase();
    const v = String(evt.venue || '').toLowerCase();
    return m === 'ONLINE' || m === 'HYBRID' || v.startsWith('http') || v.includes('teams') || v.includes('zoom') || v.includes('meet');
  };

  const onlineEvents = events.filter(isOnlineEvent);
  const currentOnlineEventId = selectedEventId && onlineEvents.some((e: any) => e.id === selectedEventId) ? selectedEventId : (onlineEvents[0]?.id ?? '');
  const selectedEvent = events.find((e: any) => e.id === (selectedEventId || events[0]?.id));

  const handleVerify = async (token: string) => {
    if (!token.trim()) {
      toast.error('Please enter a QR token.');
      return;
    }

    const eventId = selectedEventId || events[0]?.id;
    if (!eventId) {
      toast.error('Please select an event for check-in.');
      return;
    }

    if (scannedRecords.some((r) => r.id === token.trim())) {
      toast.error('Duplicate Scan Blocked!', {
        description: 'This student has already checked in for this event.',
      });
      return;
    }

    setIsVerifying(true);
    try {
      const res = await fetch('/api/attendance/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ eventId, qrToken: token.trim() }),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        const studentName = json.data?.attendance?.user?.fullName || 'Student';
        const newRecord = {
          id: token.trim(),
          name: studentName,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'Present',
        };

        setScannedRecords([newRecord, ...scannedRecords]);
        setManualQr('');
        toast.success(`Check-in Verified for ${studentName}!`, {
          description: `Attendance recorded at ${newRecord.time}`,
        });
      } else {
        toast.error('Check-in Failed', {
          description: json.error || 'Invalid or unregistered QR code.',
        });
      }
    } catch {
      toast.error('Network error executing QR verification.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCsvUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a CSV meeting attendance file first.');
      return;
    }

    const eventId = currentOnlineEventId;
    if (!eventId) {
      toast.error('Please select an online event for CSV attendance processing.');
      return;
    }

    const targetEvt = events.find((e: any) => e.id === eventId);
    if (!targetEvt || !isOnlineEvent(targetEvt)) {
      toast.error('CSV Attendance verification is only available for Online or Hybrid events.');
      return;
    }

    setIsUploadingCsv(true);
    setCsvResult(null);

    try {
      const formData = new FormData();
      formData.append('eventId', eventId);
      formData.append('file', selectedFile);

      const res = await fetch('/api/attendance/teams-csv-import', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const json = await res.json();

      if (res.ok && json.success) {
        setCsvResult(json.data);
        toast.success('Online Meeting CSV Processed Successfully!', {
          description: json.data.message,
        });
      } else {
        toast.error('CSV Processing Failed', {
          description: json.error || 'Failed to parse meeting attendance CSV.',
        });
      }
    } catch (err: any) {
      toast.error(err.message || 'Error processing meeting CSV.');
    } finally {
      setIsUploadingCsv(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <QrCode className="w-7 h-7 text-[#00A4EF]" /> Attendance & Check-in Console
          </h1>
          <p className="text-sm text-slate-600 dark:text-[#A8B0BB] mt-1">
            Verify In-Person QR Passes or Upload Online Meeting CSV Attendance Reports (&gt;50% time requirement).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="success" className="text-sm px-3 py-1 font-bold">
            Live Counter: {scannedRecords.length} Checked-in
          </Badge>
        </div>
      </div>

      {/* Mode Selector Tabs */}
      <div className="flex items-center gap-3 p-1.5 bg-slate-100 dark:bg-[#11161D] rounded-2xl border border-slate-200 dark:border-[#2A323D] w-fit">
        <button
          onClick={() => setActiveTab('QR')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
            activeTab === 'QR'
              ? 'bg-[#0078D4] text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Camera className="w-4 h-4 text-amber-300" /> In-Person QR Check-in
        </button>
        <button
          onClick={() => setActiveTab('CSV')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
            activeTab === 'CSV'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <UploadCloud className="w-4 h-4 text-emerald-300" /> Upload Online Meeting CSV (Teams / Zoom / Meet)
        </button>
      </div>

      {/* Mode 1: In-Person QR Scanner */}
      {activeTab === 'QR' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Scanner Control Box */}
          <Card className="p-6 space-y-6 border-slate-200 dark:border-[#2A323D] bg-white dark:bg-[#151B23]">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Select Active Event *</label>
              <select
                value={selectedEventId || (events[0]?.id ?? '')}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full p-2.5 text-xs bg-slate-50 dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:outline-none"
              >
                {events.map((evt: { id: string; title: string; category: string }) => (
                  <option key={evt.id} value={evt.id}>
                    {evt.title} ({evt.category})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#2A323D] pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Camera className="w-5 h-5 text-[#00A4EF]" /> Camera &amp; Manual Entry
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsScanning(!isScanning);
                  if (!isScanning) toast.info('Camera scanner initialized.');
                }}
              >
                <RefreshCw className="w-3.5 h-3.5" /> {isScanning ? 'Stop Camera' : 'Start Camera'}
              </Button>
            </div>

            {/* Camera Viewport Simulation */}
            <div className="h-64 rounded-2xl bg-slate-50 dark:bg-[#0B0F14] border-2 border-dashed border-[#00A4EF]/40 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
              {isScanning ? (
                <div className="space-y-3">
                  <div className="w-32 h-32 border-2 border-[#00A4EF] rounded-xl animate-pulse mx-auto flex items-center justify-center bg-[#00A4EF]/10">
                    <QrCode className="w-16 h-16 text-[#00A4EF] animate-bounce" />
                  </div>
                  <p className="text-xs text-[#00A4EF] font-semibold">Align student QR pass inside viewfinder</p>
                </div>
              ) : (
                <div className="space-y-2 text-slate-500">
                  <Camera className="w-12 h-12 mx-auto text-slate-400" />
                  <p className="text-xs">Camera scanner paused. Click Start Camera or enter QR token manually below.</p>
                </div>
              )}
            </div>

            {/* Manual Entry */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">Manual QR Verification Token</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualQr}
                  onChange={(e) => setManualQr(e.target.value)}
                  placeholder="Paste or enter registration QR token..."
                  className="flex-1 px-3 py-2.5 text-xs bg-slate-50 dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:outline-none font-mono"
                />
                <Button variant="fluent" size="sm" disabled={isVerifying} onClick={() => handleVerify(manualQr)} className="font-bold">
                  {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify Scan'}
                </Button>
              </div>
            </div>
          </Card>

          {/* Real-time Verification Feed */}
          <Card className="p-6 space-y-4 border-slate-200 dark:border-[#2A323D] bg-white dark:bg-[#151B23]">
            <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-[#2A323D] pb-3 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Recent Live Scans Feed
            </h3>

            {scannedRecords.length === 0 ? (
              <div className="text-center py-16 text-slate-500 text-xs">
                <AlertTriangle className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                No check-in scans recorded in this session yet.
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {scannedRecords.map((rec, idx) => (
                  <div key={`${rec.id}-${idx}`} className="p-4 rounded-xl bg-slate-50 dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 flex items-center justify-center">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">{rec.name}</h4>
                        <p className="text-[11px] font-mono text-[#00A4EF]">{rec.id}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <Badge variant="success" size="sm">Checked In</Badge>
                      <p className="text-[10px] text-slate-500 mt-1">{rec.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Mode 2: Online Meeting CSV Upload */}
      {activeTab === 'CSV' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* CSV Upload Form Card */}
          <Card className="p-6 space-y-6 border-slate-200 dark:border-[#2A323D] bg-white dark:bg-[#151B23]">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Select Online Event *</label>
              {onlineEvents.length > 0 ? (
                <select
                  value={currentOnlineEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="w-full p-2.5 text-xs bg-slate-50 dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:outline-none"
                >
                  {onlineEvents.map((evt: { id: string; title: string; category: string; mode?: string }) => (
                    <option key={evt.id} value={evt.id}>
                      {evt.title} ({evt.category}) [{evt.mode || 'ONLINE'}]
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-semibold">
                  No Online or Hybrid events available for CSV processing. In-person/offline events use QR Code check-in.
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-[#2A323D] pb-3">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" /> Upload Meeting Attendance File (.csv)
              </h3>
              <p className="text-xs text-slate-500 dark:text-[#A8B0BB]">
                Upload your Teams / Zoom / Google Meet attendance CSV log file. Students attending for **&gt;50% of the total meeting duration** will be marked <strong>PRESENT</strong> (+50 Community Points).
              </p>
            </div>

            {/* File Dropzone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                selectedFile
                  ? 'border-emerald-500/50 bg-emerald-500/5'
                  : 'border-slate-300 dark:border-slate-700 hover:border-emerald-500 bg-slate-50 dark:bg-[#0B0F14]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
              <UploadCloud className={`w-12 h-12 mx-auto ${selectedFile ? 'text-emerald-400 animate-bounce' : 'text-slate-400'}`} />
              {selectedFile ? (
                <div className="mt-2 space-y-1">
                  <p className="text-xs font-bold text-emerald-400">{selectedFile.name}</p>
                  <p className="text-[11px] text-slate-400">{(selectedFile.size / 1024).toFixed(1)} KB • CSV File Selected</p>
                </div>
              ) : (
                <div className="mt-2 space-y-1">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Click to browse or drop CSV meeting file</p>
                  <p className="text-[11px] text-slate-400">Supports MS Teams, Zoom, or Google Meet CSV exports</p>
                </div>
              )}
            </div>

            <Button
              variant="fluent"
              size="lg"
              disabled={isUploadingCsv || !selectedFile}
              onClick={handleCsvUpload}
              className="w-full font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
            >
              {isUploadingCsv ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Processing &amp; Evaluating 50% Threshold...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Process &amp; Mark Attendance
                </>
              )}
            </Button>
          </Card>

          {/* Meeting Attendance Evaluation Results Card */}
          <Card className="p-6 space-y-4 border-slate-200 dark:border-[#2A323D] bg-white dark:bg-[#151B23]">
            <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-[#2A323D] pb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" /> Attendance Evaluation Report
            </h3>

            {!csvResult ? (
              <div className="text-center py-20 text-slate-500 text-xs space-y-2">
                <FileSpreadsheet className="w-10 h-10 mx-auto text-slate-400" />
                <p className="font-semibold text-slate-700 dark:text-slate-300">No CSV file processed yet.</p>
                <p className="text-[11px] text-slate-400">Upload a meeting log CSV on the left to evaluate student durations.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Summary Banner */}
                <div className="p-4 rounded-xl bg-slate-100 dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-600 dark:text-slate-400">Total Meeting Duration:</span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">{csvResult.meetingDurationMinutes} mins</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-600 dark:text-slate-400">Required 50% Threshold:</span>
                    <span className="font-bold text-[#00A4EF] font-mono">&ge; {csvResult.requiredThresholdMinutes} mins</span>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200 dark:border-slate-800">
                    <span className="font-bold text-emerald-400">Passed (&ge;50% Duration):</span>
                    <span className="font-extrabold text-emerald-400">{csvResult.passedCount} Students</span>
                  </div>
                  {csvResult.disqualifiedCount > 0 && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-rose-400">Disqualified (&lt;50% Duration):</span>
                      <span className="font-extrabold text-rose-400">{csvResult.disqualifiedCount} Students</span>
                    </div>
                  )}
                </div>

                {/* Passed Students List */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Passed &amp; Marked Present ({csvResult.passedStudents.length})
                  </h4>
                  {csvResult.passedStudents.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No registered students met the 50% threshold in this file.</p>
                  ) : (
                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                      {csvResult.passedStudents.map((st: any, idx: number) => (
                        <div key={idx} className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-2 text-xs">
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">{st.fullName}</p>
                            <p className="text-[11px] text-slate-400">{st.email}</p>
                          </div>
                          <Badge variant="success" className="font-mono text-[11px]">
                            {st.duration} mins (&ge;50%)
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Disqualified Students List */}
                {csvResult.disqualifiedStudents.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-[#2A323D]">
                    <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                      <XCircle className="w-3.5 h-3.5" /> Disqualified (&lt;50% Time) ({csvResult.disqualifiedStudents.length})
                    </h4>
                    <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                      {csvResult.disqualifiedStudents.map((st: any, idx: number) => (
                        <div key={idx} className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between gap-2 text-xs">
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">{st.fullName}</p>
                            <p className="text-[11px] text-slate-400">{st.email}</p>
                          </div>
                          <Badge variant="danger" className="font-mono text-[11px]">
                            {st.duration} mins (&lt;50%)
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
