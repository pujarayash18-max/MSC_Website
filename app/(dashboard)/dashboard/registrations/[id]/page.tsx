'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { INITIAL_EVENTS } from '@/lib/services/dataService';
import { ArrowLeft, Users, QrCode, CheckCircle2, Download } from 'lucide-react';
import { GithubIcon } from '@/components/icons';

export default function RegistrationDetailPage() {
  const params = useParams();
  const regId = params?.id as string;
  const event = INITIAL_EVENTS[0];

  return (
    <div className="max-w-4xl space-y-6">
      <Link href="/dashboard/registrations">
        <Button variant="outline" size="sm">
          <ArrowLeft className="w-4 h-4" /> Back to My Registrations
        </Button>
      </Link>

      <Card className="p-6 space-y-6 border-slate-200 dark:border-[#2A323D]">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4 border-b border-slate-200 dark:border-[#2A323D] pb-4">
          <div>
            <span className="text-xs font-mono text-[#00A4EF] font-bold">Registration Reference: {regId || 'reg_az_8801'}</span>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{event.title}</h1>
            <p className="text-xs text-slate-500 dark:text-[#A8B0BB] mt-1">Submitted on Aug 05, 2026 • Venue: {event.venue}</p>
          </div>
          <Badge variant="success" className="text-sm px-3 py-1">Registration Approved</Badge>
        </div>

        {/* Entry Pass Section */}
        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <Badge variant="primary">Verified QR Entry Pass</Badge>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Rahul Sharma</h3>
            <p className="text-xs text-slate-600 dark:text-[#A8B0BB]">Enrollment: 92100103045 • Computer Engineering (3rd Year)</p>
            <p className="text-xs font-mono text-[#00A4EF] font-bold">Pass Code: MCC-PASS-2026-AZ8801</p>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-lg text-center">
            <svg className="w-32 h-32 text-slate-950 mx-auto" viewBox="0 0 100 100" fill="currentColor">
              <path d="M0,0 h30 v30 h-30 z M40,0 h20 v10 h-20 z M70,0 h30 v30 h-30 z M10,10 h10 v10 h-10 z M80,10 h10 v10 h-10 z M0,40 h10 v20 h-10 z M30,40 h30 v10 h-30 z M70,40 h10 v10 h-10 z M0,70 h30 v30 h-30 z M10,80 h10 v10 h-10 z M40,70 h20 v30 h-20 z M70,70 h30 v10 h-30 z M80,90 h20 v10 h-20 z" />
            </svg>
            <Button variant="fluent" size="sm" className="mt-3 w-full">
              <Download className="w-4 h-4" /> Save Pass
            </Button>
          </div>
        </div>

        {/* Hackathon Team Details (§44) */}
        <div className="space-y-4 pt-2">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-[#00A4EF]" /> Team & Project Submission
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] space-y-2">
              <span className="text-[11px] text-slate-500 font-semibold uppercase">Team Identity</span>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Azure Innovators</p>
              <p className="text-slate-600 dark:text-[#A8B0BB]">Track: Generative AI & HealthTech</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] space-y-2">
              <span className="text-[11px] text-slate-500 font-semibold uppercase">Project Submission</span>
              <p className="text-sm font-bold text-[#7FBA00] flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> GitHub Repository Verified
              </p>
              <a href="https://github.com/rahulsharma-mu/azure-health-ai" target="_blank" rel="noreferrer" className="text-[#0078D4] dark:text-[#00A4EF] hover:underline flex items-center gap-1 font-semibold">
                <GithubIcon className="w-3.5 h-3.5" /> github.com/rahulsharma-mu/azure-health-ai
              </a>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
