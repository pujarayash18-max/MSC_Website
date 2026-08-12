'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { QrCode, Calendar, ChevronRight, Download, FileText, Loader2, XCircle } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface RegistrationItem {
  id: string;
  submittedAt: string;
  registrationStatus: string;
  qrToken: string;
  event: {
    id: string;
    title: string;
    slug: string;
    startDate: string;
    banner: string;
  };
}

async function fetchRegistrations(): Promise<RegistrationItem[]> {
  const res = await fetch('/api/registrations', { credentials: 'include' });
  if (!res.ok) return [];
  const json = await res.json();
  return json.data?.registrations || [];
}

export default function StudentRegistrationsPage() {
  const [selectedQr, setSelectedQr] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: registrations = [], isLoading } = useQuery({
    queryKey: ['my-registrations'],
    queryFn: fetchRegistrations,
  });

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this event registration? Your seat will be released.')) return;
    try {
      const res = await fetch(`/api/registrations/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Registration cancelled successfully.');
        queryClient.invalidateQueries({ queryKey: ['my-registrations'] });
      } else {
        toast.error('Failed to cancel registration.');
      }
    } catch {
      toast.error('Network error.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <FileText className="w-7 h-7 text-[#00A4EF]" /> My Registered Events &amp; Passes
        </h1>
        <p className="text-sm text-slate-600 dark:text-[#A8B0BB] mt-1">
          Manage your upcoming workshop bookings, view hackathon team status, and access verified QR entry passes.
        </p>
      </div>

      <Card className="p-6 space-y-4 border-slate-200 dark:border-[#2A323D]">
        <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-[#2A323D] pb-3">
          Confirmed Event Registrations ({registrations.length})
        </h2>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#00A4EF]" />
          </div>
        ) : registrations.length === 0 ? (
          <div className="text-center py-12 text-slate-500 space-y-3">
            <p>You have not registered for any events yet.</p>
            <Link href="/events">
              <Button variant="fluent" size="sm">Explore Catalog</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {registrations.map((reg) => (
              <div
                key={reg.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-900">
                    <Image
                      src={reg.event?.banner || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600'}
                      alt={reg.event?.title || 'Event'}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={reg.registrationStatus === 'WAITLISTED' ? 'warning' : 'success'}>
                        {reg.registrationStatus || 'Approved'}
                      </Badge>
                      <span className="text-[11px] text-slate-500 font-mono">ID: {reg.id}</span>
                    </div>

                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                      {reg.event?.title || 'Registered Event'}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-[#A8B0BB]">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#00A4EF]" />
                        {new Date(reg.event?.startDate || reg.submittedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 font-bold text-[#00A4EF]"
                    onClick={() => setSelectedQr(reg.qrToken || reg.id)}
                  >
                    <QrCode className="w-4 h-4" /> Entry Pass
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 font-semibold text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 border-rose-500/30"
                    onClick={() => handleCancel(reg.id)}
                  >
                    <XCircle className="w-4 h-4" /> Cancel
                  </Button>

                  <Link href={`/dashboard/registrations/${reg.id}`}>
                    <Button variant="fluent" size="sm" className="gap-1">
                      Details <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* QR Pass Modal */}
      {selectedQr && (
        <Modal
          isOpen={!!selectedQr}
          onClose={() => setSelectedQr(null)}
          title="Digital Entry Pass"
          description="Present this verified QR code at the event check-in desk."
        >
          <div className="text-center space-y-4 py-4">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 w-fit mx-auto shadow-xl">
              <svg className="w-40 h-40 text-slate-950 mx-auto" viewBox="0 0 100 100" fill="currentColor">
                <path d="M0,0 h30 v30 h-30 z M40,0 h20 v10 h-20 z M70,0 h30 v30 h-30 z M10,10 h10 v10 h-10 z M80,10 h10 v10 h-10 z M0,40 h10 v20 h-10 z M30,40 h30 v10 h-30 z M70,40 h10 v10 h-10 z M0,70 h30 v30 h-30 z M10,80 h10 v10 h-10 z M40,70 h20 v30 h-20 z M70,70 h30 v10 h-30 z M80,90 h20 v10 h-20 z" />
              </svg>
            </div>
            <p className="text-xs font-mono text-[#00A4EF] font-bold">Token: {selectedQr}</p>
            <Button variant="fluent" size="sm" className="w-full">
              <Download className="w-4 h-4" /> Save Pass to Device
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
