'use client';

import Link from 'next/link';
import { ShieldAlert, RefreshCw, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
      <Card className="max-w-lg w-full p-8 text-center space-y-6 border border-amber-500/30 bg-[#151B23] shadow-2xl rounded-3xl">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto shadow-inner border border-amber-500/20">
          <ShieldAlert className="w-9 h-9 animate-pulse" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            Scheduled Platform Maintenance
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight">
            MCC Platform Under Maintenance
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            Our engineering team is currently performing scheduled system updates, telemetry maintenance, and database optimizations. Public access is temporarily paused.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0D1117] border border-[#2A323D] text-xs text-left space-y-2">
          <div className="font-bold text-white flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-[#00A4EF]" /> Admin Console Access Unrestricted
          </div>
          <p className="text-slate-400 text-[11px]">
            Executive Board members and administrators can sign in to manage operations or toggle maintenance status.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button variant="fluent" onClick={() => window.location.reload()} className="font-bold text-xs gap-2 w-full sm:w-auto">
            <RefreshCw className="w-3.5 h-3.5" /> Check Status
          </Button>
          <Link href="/login" className="w-full sm:w-auto">
            <Button variant="outline" size="sm" className="font-bold text-xs gap-2 border-slate-700 text-slate-300 w-full">
              Admin Login
            </Button>
          </Link>
          <a href="mailto:mcc@marwadiuniversity.ac.in" className="w-full sm:w-auto">
            <Button variant="outline" size="sm" className="font-bold text-xs gap-2 border-slate-700 text-slate-300 w-full">
              <Mail className="w-3.5 h-3.5" /> Support
            </Button>
          </a>
        </div>
      </Card>
    </div>
  );
}
