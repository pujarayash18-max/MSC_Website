'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { INITIAL_EVENTS } from '@/lib/services/dataService';
import { toast } from 'sonner';
import { QrCode, Calendar, MapPin, CheckCircle, ChevronRight, Download } from 'lucide-react';

const MOCK_REGISTRATIONS = [
  {
    registrationId: 'reg_az_8801',
    event: INITIAL_EVENTS[0],
    submittedAt: '2026-08-05T10:15:00.000Z',
    status: 'Approved',
    qrToken: 'MCC-AZ-2026-REG8801-VERIFIED',
    attendanceStatus: 'Checked In',
    certificateStatus: 'Pending'
  },
  {
    registrationId: 'reg_hk_9902',
    event: INITIAL_EVENTS[1],
    submittedAt: '2026-08-11T14:30:00.000Z',
    status: 'Approved',
    qrToken: 'MCC-HK-2026-REG9902-VERIFIED',
    attendanceStatus: 'Pending',
    certificateStatus: 'Pending'
  }
];

export default function StudentRegistrationsPage() {
  const [selectedQr, setSelectedQr] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <FileCheck className="w-7 h-7 text-sky-400" /> My Event Registrations (§41, §42)
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          View your confirmed registrations, download your QR entry pass, and check hackathon team details.
        </p>
      </div>

      <div className="space-y-4">
        {MOCK_REGISTRATIONS.map((reg) => (
          <Card key={reg.registrationId} className="p-6 border-slate-800 hover:border-sky-500/40 transition-all">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <img
                  src={reg.event.banner}
                  alt={reg.event.title}
                  className="w-20 h-20 rounded-2xl object-cover border border-sky-400/30 shrink-0 hidden sm:block"
                />
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Badge variant="success">{reg.status}</Badge>
                    <span className="text-[11px] text-slate-500 font-mono">{reg.registrationId}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">{reg.event.title}</h3>
                  <p className="text-xs text-slate-400 flex items-center gap-4">
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-sky-400" /> Aug 25, 2026</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-sky-400" /> {reg.event.venue}</span>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedQr(reg.qrToken)}
                  className="gap-2 border-sky-500/30 text-sky-400 hover:bg-sky-500/10"
                >
                  <QrCode className="w-4 h-4" /> View QR Pass
                </Button>

                <Link href={`/dashboard/registrations/${reg.registrationId}`}>
                  <Button variant="fluent" size="sm">
                    Details & Team <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* QR Modal */}
      <Modal
        isOpen={!!selectedQr}
        onClose={() => setSelectedQr(null)}
        title="Event Check-in QR Pass"
        description="Show this QR code to the volunteer at the venue entrance."
        maxWidth="sm"
      >
        <div className="text-center p-4 space-y-4">
          <div className="p-6 bg-white rounded-2xl max-w-[220px] mx-auto shadow-2xl">
            {/* SVG QR Code Illustration */}
            <svg className="w-full h-full text-slate-950" viewBox="0 0 100 100" fill="currentColor">
              <path d="M0,0 h30 v30 h-30 z M40,0 h20 v10 h-20 z M70,0 h30 v30 h-30 z M10,10 h10 v10 h-10 z M80,10 h10 v10 h-10 z M0,40 h10 v20 h-10 z M30,40 h30 v10 h-30 z M70,40 h10 v10 h-10 z M0,70 h30 v30 h-30 z M10,80 h10 v10 h-10 z M40,70 h20 v30 h-20 z M70,70 h30 v10 h-30 z M80,90 h20 v10 h-20 z" />
            </svg>
          </div>
          <p className="text-xs font-mono text-sky-400 font-bold">{selectedQr}</p>
          <Button variant="outline" size="sm" className="w-full" onClick={() => toast.success('QR Code downloaded!')}>
            <Download className="w-4 h-4" /> Download Pass Image
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function FileCheck(props: any) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
