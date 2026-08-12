'use client';

import Link from 'next/link';
import { ShieldAlert, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-6">
        <div className="w-20 h-20 bg-[#00A4EF]/10 border border-[#00A4EF]/30 rounded-3xl flex items-center justify-center mx-auto text-[#00A4EF]">
          <ShieldAlert className="w-10 h-10 animate-pulse" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#00A4EF]">Scheduled Platform Maintenance</span>
          <h1 className="text-3xl font-extrabold text-white">We'll be right back</h1>
          <p className="text-sm text-slate-400">
            Microsoft Campus Club Marwadi University is performing scheduled database &amp; platform upgrades. Please check back shortly.
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="fluent" onClick={() => window.location.reload()} className="font-bold gap-2">
            <RefreshCw className="w-4 h-4" /> Check System Status
          </Button>
          <Link href="/login">
            <Button variant="outline" className="font-bold border-slate-700 text-slate-300 w-full">
              Admin Login
            </Button>
          </Link>
        </div>

        <p className="text-xs text-slate-600 border-t border-slate-800 pt-6">
          Microsoft Campus Club • Marwadi University Executive Board
        </p>
      </div>
    </div>
  );
}
