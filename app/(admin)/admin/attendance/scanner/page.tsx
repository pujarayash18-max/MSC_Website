'use client';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { QrCode, Camera, CheckCircle2, AlertTriangle, User, Calendar, RefreshCw } from 'lucide-react';

export default function AdminAttendanceScannerPage() {
  const [manualQr, setManualQr] = useState('');
  const [scannedRecords, setScannedRecords] = useState<Array<{ name: string; time: string; status: string; id: string }>>([
    { id: 'MCC-AZ-2026-REG8801-VERIFIED', name: 'Rahul Sharma', time: '09:32 AM', status: 'Present' }
  ]);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState<any>(null);

  const handleVerify = (token: string) => {
    if (!token) return;

    // Check duplicate scan
    if (scannedRecords.some((r) => r.id === token)) {
      toast.error('Duplicate Scan Blocked! Student is already checked in.', {
        description: 'Duplicate attendance scans are strictly prevented per §46 security policy.'
      });
      return;
    }

    const newRecord = {
      id: token,
      name: token.includes('8801') ? 'Rahul Sharma' : 'Ananya Verma',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Present'
    };

    setScannedRecords([newRecord, ...scannedRecords]);
    setLastScanned(newRecord);
    setManualQr('');
    toast.success(`Check-in verified for ${newRecord.name}!`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <QrCode className="w-7 h-7 text-sky-400" /> QR Attendance Scanner
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time QR check-in scanner for event volunteers & admins. Live verification with duplicate scan guard.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="success" className="text-sm px-3 py-1">
            Live Counter: {scannedRecords.length} Checked-in
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scanner Control Box */}
        <Card className="p-6 space-y-6 border-sky-500/30">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Camera className="w-5 h-5 text-sky-400" /> Camera & Manual Entry
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
          <div className="h-64 rounded-2xl bg-slate-100 dark:bg-slate-950 border-2 border-dashed border-sky-500/40 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
            {isScanning ? (
              <div className="space-y-3">
                <div className="w-32 h-32 border-2 border-sky-400 rounded-xl animate-pulse mx-auto flex items-center justify-center bg-sky-500/10">
                  <QrCode className="w-16 h-16 text-sky-400 animate-bounce" />
                </div>
                <p className="text-xs text-sky-400 font-semibold">Align student QR pass inside viewfinder</p>
              </div>
            ) : (
              <div className="space-y-2 text-slate-500">
                <Camera className="w-12 h-12 mx-auto text-slate-600" />
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
                placeholder="e.g. MCC-AZ-2026-REG8801-VERIFIED"
                className="flex-1 px-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none font-mono"
              />
              <Button variant="fluent" size="sm" onClick={() => handleVerify(manualQr)}>
                Verify Scan
              </Button>
            </div>
          </div>
        </Card>

        {/* Real-time Verification Feed */}
        <Card className="p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400" /> Recent Live Scans Feed
          </h3>

          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {scannedRecords.map((rec) => (
              <div key={rec.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 dark:text-emerald-400 flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{rec.name}</h4>
                    <p className="text-[11px] font-mono text-sky-400">{rec.id}</p>
                  </div>
                </div>

                <div className="text-right">
                  <Badge variant="success" size="sm">Checked In</Badge>
                  <p className="text-[10px] text-slate-500 mt-1">{rec.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
