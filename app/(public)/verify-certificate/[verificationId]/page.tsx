'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { INITIAL_CERTIFICATES } from '@/lib/services/dataService';
import { ShieldCheck, ShieldAlert, ArrowLeft, Download } from 'lucide-react';

export default function CertificateVerificationResultPage() {
  const params = useParams();
  const rawId = (params?.verificationId as string) || '';
  const verificationId = decodeURIComponent(rawId).trim();

  const cert = INITIAL_CERTIFICATES.find(
    (c) => c.verificationId.toLowerCase() === verificationId.toLowerCase()
  );

  if (!cert) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <Link href="/verify-certificate">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4" /> Verify Another Certificate
          </Button>
        </Link>

        <Card className="p-8 sm:p-10 space-y-6 border-rose-500/40 bg-white dark:bg-[#151B23] shadow-2xl text-center">
          <div className="w-16 h-16 rounded-full bg-rose-500/20 border-2 border-rose-500 text-rose-500 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/20">
            <ShieldAlert className="w-9 h-9" />
          </div>

          <div>
            <Badge variant="danger" className="mb-2 text-xs font-extrabold px-3 py-1">
              ✕ Certificate Not Found
            </Badge>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">Verification Failed</h1>
            <p className="text-xs font-mono text-rose-400 font-bold mt-1">Provided Verification ID: {verificationId || 'N/A'}</p>
          </div>

          <div className="p-6 rounded-2xl bg-rose-500/5 border border-rose-500/20 text-slate-600 dark:text-[#A8B0BB] text-xs leading-relaxed max-w-lg mx-auto">
            No official Microsoft Campus Club (MCC) certificate was found matching this verification code. Please check for typos or contact the event coordinators at <a href="mailto:mcc@marwadiuniversity.ac.in" className="text-sky-400 underline">mcc@marwadiuniversity.ac.in</a>.
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
      <Link href="/verify-certificate">
        <Button variant="outline" size="sm">
          <ArrowLeft className="w-4 h-4" /> Verify Another Certificate
        </Button>
      </Link>

      <Card className="p-8 sm:p-10 space-y-6 border-[#7FBA00]/40 bg-white dark:bg-[#151B23] shadow-2xl text-center">
        <div className="w-16 h-16 rounded-full bg-[#7FBA00]/20 border-2 border-[#7FBA00] text-[#7FBA00] flex items-center justify-center mx-auto shadow-lg shadow-[#7FBA00]/20">
          <ShieldCheck className="w-9 h-9" />
        </div>

        <div>
          <Badge variant="success" className="mb-2 text-xs font-extrabold px-3 py-1">
            ✓ Authenticity Verified
          </Badge>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Official Certificate Verified</h1>
          <p className="text-xs font-mono text-[#7FBA00] font-bold mt-1">Verification ID: {cert.verificationId}</p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] text-left space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-500 font-semibold uppercase block">Student Recipient</span>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{cert.studentName}</p>
              <p className="text-slate-500 dark:text-[#A8B0BB]">Enrollment: {cert.enrollmentNumber}</p>
            </div>

            <div>
              <span className="text-slate-500 font-semibold uppercase block">Issuing Organization</span>
              <p className="text-sm font-bold text-[#00A4EF] mt-0.5">{cert.issuer}</p>
            </div>

            <div>
              <span className="text-slate-500 font-semibold uppercase block">Event Title</span>
              <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">{cert.eventName}</p>
              <p className="text-xs text-sky-400 font-semibold">{cert.eventType}</p>
            </div>

            <div>
              <span className="text-slate-500 font-semibold uppercase block">Issue Date</span>
              <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">{cert.issueDate}</p>
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-center">
          <Button variant="fluent" size="lg">
            <Download className="w-4 h-4" /> Download Official PDF Certificate
          </Button>
        </div>
      </Card>
    </div>
  );
}
