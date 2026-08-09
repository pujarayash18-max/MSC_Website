'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { INITIAL_EVENTS, dynamicDb } from '@/lib/services/dataService';
import { toast } from 'sonner';
import { QrCode, Calendar, MapPin, ChevronRight, Download, FileText } from 'lucide-react';

const STATIC_REGISTRATIONS = [
  {
    registrationId: 'reg_az_8801',
    eventTitle: INITIAL_EVENTS[0].title,
    eventVenue: INITIAL_EVENTS[0].venue,
    banner: INITIAL_EVENTS[0].banner,
    submittedAt: '2026-08-05T10:15:00.000Z',
    status: 'Approved',
    qrToken: 'MCC-AZ-2026-REG8801-VERIFIED',
    attendanceStatus: 'Checked In'
  },
  {
    registrationId: 'reg_hk_9902',
    eventTitle: INITIAL_EVENTS[1].title,
    eventVenue: INITIAL_EVENTS[1].venue,
    banner: INITIAL_EVENTS[1].banner,
    submittedAt: '2026-08-11T14:30:00.000Z',
    status: 'Approved',
    qrToken: 'MCC-HK-2026-REG9902-VERIFIED',
    attendanceStatus: 'Pending'
  }
];

export default function StudentRegistrationsPage() {
  const [selectedQr, setSelectedQr] = useState<string | null>(null);
  const [allRegs] = useState(() => {
    if (typeof window === 'undefined') return STATIC_REGISTRATIONS;
    const saved = dynamicDb.getRegistrations();
    if (saved && saved.length > 0) {
      const mappedSaved = saved.map((s: Record<string, unknown>) => ({
        registrationId: String(s.registrationId || ''),
        eventTitle: String(s.eventTitle || ''),
        eventVenue: 'Seminar Hall 4, Main Campus',
        banner: INITIAL_EVENTS[0].banner,
        submittedAt: String(s.createdAt || new Date().toISOString()),
        status: String(s.status || 'Approved'),
        qrToken: String(s.qrPassCode || `MCC-PASS-${s.registrationId}`),
        attendanceStatus: 'Registered'
      }));
      return [...mappedSaved, ...STATIC_REGISTRATIONS];
    }
    return STATIC_REGISTRATIONS;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <FileText className="w-7 h-7 text-[#00A4EF]" /> My Event Registrations
        </h1>
        <p className="text-sm text-slate-600 dark:text-[#A8B0BB] mt-1">
          View your confirmed registrations, download your QR entry pass, and check event schedules.
        </p>
      </div>

      <div className="space-y-4">
        {allRegs.map((reg) => (
          <Card key={reg.registrationId} className="p-6 border-slate-200 dark:border-[#2A323D] hover:border-[#00A4EF]/50 transition-all">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <Image
                  src={reg.banner}
                  alt={reg.eventTitle}
                  width={80}
                  height={80}
                  className="w-20 h-20 rounded-2xl object-cover border border-[#00A4EF]/30 shrink-0 hidden sm:block shadow-sm"
                />
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Badge variant="success">{reg.status}</Badge>
                    <span className="text-[11px] font-mono text-slate-500 dark:text-[#A8B0BB]">{reg.registrationId}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{reg.eventTitle}</h3>
                  <p className="text-xs text-slate-600 dark:text-[#A8B0BB] flex items-center gap-4">
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-[#00A4EF]" /> Aug 25, 2026</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-[#00A4EF]" /> {reg.eventVenue}</span>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedQr(reg.qrToken)}
                  className="gap-2 border-[#00A4EF]/40 text-[#0078D4] dark:text-[#00A4EF] hover:bg-[#00A4EF]/10"
                >
                  <QrCode className="w-4 h-4" /> View QR Pass
                </Button>

                <Link href={`/dashboard/registrations/${reg.registrationId}`}>
                  <Button variant="fluent" size="sm">
                    Pass Details <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* QR Pass Modal */}
      <Modal
        isOpen={!!selectedQr}
        onClose={() => setSelectedQr(null)}
        title="Official Event Entry QR Pass"
        description="Present this QR code at the event entrance for automated check-in."
        maxWidth="sm"
      >
        <div className="text-center p-4 space-y-4">
          <div className="p-6 bg-white rounded-2xl max-w-[220px] mx-auto shadow-2xl border border-slate-200">
            <svg className="w-full h-full text-slate-950" viewBox="0 0 100 100" fill="currentColor">
              <path d="M0,0 h30 v30 h-30 z M40,0 h20 v10 h-20 z M70,0 h30 v30 h-30 z M10,10 h10 v10 h-10 z M80,10 h10 v10 h-10 z M0,40 h10 v20 h-10 z M30,40 h30 v10 h-30 z M70,40 h10 v10 h-10 z M0,70 h30 v30 h-30 z M10,80 h10 v10 h-10 z M40,70 h20 v30 h-20 z M70,70 h30 v10 h-30 z M80,90 h20 v10 h-20 z" />
            </svg>
          </div>
          <p className="text-xs font-mono text-[#00A4EF] font-extrabold">{selectedQr}</p>
          <Button variant="fluent" size="sm" className="w-full" onClick={() => toast.success('QR Code Pass downloaded!')}>
            <Download className="w-4 h-4" /> Download QR Pass Image
          </Button>
        </div>
      </Modal>
    </div>
  );
}
