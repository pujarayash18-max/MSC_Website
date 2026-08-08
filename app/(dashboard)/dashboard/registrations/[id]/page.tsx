'use client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { INITIAL_EVENTS } from '@/lib/services/dataService';
import { ArrowLeft, Users, QrCode, Code, CheckCircle, Globe } from 'lucide-react';
import { GithubIcon } from '@/components/icons';

export default function RegistrationDetailPage() {
  const params = useParams();
  const regId = params?.id as string;
  const event = INITIAL_EVENTS[1]; // Hackathon Event Example

  return (
    <div className="max-w-4xl space-y-6">
      <Link href="/dashboard/registrations">
        <Button variant="outline" size="sm">
          <ArrowLeft className="w-4 h-4" /> Back to My Registrations
        </Button>
      </Link>

      <Card className="p-6 space-y-6 border-sky-500/30">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-mono text-sky-400 font-bold">Registration ID: {regId || 'reg_hk_9902'}</span>
            <h1 className="text-2xl font-extrabold text-white mt-1">{event.title}</h1>
            <p className="text-xs text-slate-400 mt-1">Submitted on Aug 11, 2026 • Status: Approved</p>
          </div>
          <Badge variant="success" className="text-sm px-3 py-1">Registration Approved</Badge>
        </div>

        {/* Hackathon Team Dashboard (§44) */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-sky-400" /> Hackathon Team Details (§44)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-[11px] text-slate-500 font-semibold uppercase">Team Identity</span>
              <p className="text-sm font-bold text-white">Azure Innovators</p>
              <p className="text-slate-400">Track: Generative AI & HealthTech</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-[11px] text-slate-500 font-semibold uppercase">Project Submission</span>
              <p className="text-sm font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> Repository Linked
              </p>
              <a href="https://github.com/rahulsharma-mu/azure-health-ai" target="_blank" rel="noreferrer" className="text-sky-400 hover:underline flex items-center gap-1">
                <GithubIcon className="w-3.5 h-3.5" /> github.com/rahulsharma-mu/azure-health-ai
              </a>
            </div>
          </div>

          <Card className="p-4 bg-slate-950/60 space-y-3">
            <h4 className="text-xs font-bold text-white">Team Roster (4 Members)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                <span className="font-medium text-white">Rahul Sharma (Leader)</span>
                <Badge variant="primary" size="sm">Leader</Badge>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                <span className="font-medium text-white">Ananya Verma</span>
                <Badge variant="default" size="sm">Member</Badge>
              </div>
            </div>
          </Card>
        </div>
      </Card>
    </div>
  );
}
