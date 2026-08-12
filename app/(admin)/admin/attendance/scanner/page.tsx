'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { QrCode, Camera, CheckCircle2, User, RefreshCw, AlertTriangle, Loader2 } from 'lucide-react';
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
  const [manualQr, setManualQr] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [scannedRecords, setScannedRecords] = useState<Array<{ name: string; time: string; status: string; id: string }>>([]);
  const [isScanning, setIsScanning] = useState(false);

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

    // Check duplicate scan locally
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <QrCode className="w-7 h-7 text-[#00A4EF]" /> QR Attendance Scanner
          </h1>
          <p className="text-sm text-slate-600 dark:text-[#A8B0BB] mt-1">
            Real-time QR check-in scanner for event volunteers &amp; admins.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="success" className="text-sm px-3 py-1 font-bold">
            Live Counter: {scannedRecords.length} Checked-in
          </Badge>
        </div>
      </div>

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
    </div>
  );
}
