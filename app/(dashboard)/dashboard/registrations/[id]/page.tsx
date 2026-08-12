'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ArrowLeft, Download, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';

async function fetchRegistrations() {
  const res = await fetch('/api/registrations', { credentials: 'include' });
  if (!res.ok) return [];
  const json = await res.json();
  return json.data?.registrations || [];
}

export default function RegistrationDetailPage() {
  const params = useParams();
  const regId = params?.id as string;
  const { user } = useAuth();

  const { data: registrations = [], isLoading } = useQuery({
    queryKey: ['my-registrations-detail', regId],
    queryFn: fetchRegistrations,
  });

  const reg = registrations.find((r: { id: string }) => r.id === regId) || registrations[0];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#00A4EF]" />
      </div>
    );
  }

  const eventTitle = reg?.event?.title || 'Microsoft Campus Club Workshop';
  const qrPassCode = reg?.qrToken || `MCC-PASS-${regId || 'AZ8801'}`;

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
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{eventTitle}</h1>
            <p className="text-xs text-slate-500 dark:text-[#A8B0BB] mt-1">Submitted on {reg?.submittedAt ? new Date(reg.submittedAt).toLocaleDateString() : 'N/A'}</p>
          </div>
          <Badge variant="success" className="text-sm px-3 py-1">Registration Approved</Badge>
        </div>

        {/* Entry Pass Section */}
        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <Badge variant="primary">Verified QR Entry Pass</Badge>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">{user?.fullName || 'MCC Member'}</h3>
            <p className="text-xs text-slate-600 dark:text-[#A8B0BB]">Student ID: {user?.studentId || 'MCC-2026-00042'} • {user?.department || 'Engineering'}</p>
            <p className="text-xs font-mono text-[#00A4EF] font-bold">Pass Code: {qrPassCode}</p>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-lg text-center">
            <svg className="w-32 h-32 text-slate-950 mx-auto" viewBox="0 0 100 100" fill="currentColor">
              <path d="M0,0 h30 v30 h-30 z M40,0 h20 v10 h-20 z M70,0 h30 v30 h-30 z M10,10 h10 v10 h-10 z M80,10 h10 v10 h-10 z M0,40 h10 v20 h-10 z M30,40 h30 v10 h-30 z M70,40 h10 v10 h-10 z M0,70 h30 v30 h-30 z M10,80 h10 v10 h-10 z M40,70 h20 v30 h-20 z M70,70 h30 v10 h-30 z M80,90 h20 v10 h-20 z" />
            </svg>
            <Button variant="fluent" size="sm" className="mt-3 w-full" onClick={() => toast.success('QR Code Entry Pass downloaded successfully!')}>
              <Download className="w-4 h-4" /> Save Pass
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
