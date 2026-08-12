'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ShieldCheck, ShieldAlert, ArrowLeft, Download, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { formatDateDeterministic } from '@/lib/date';

interface VerifiedCert {
  verificationCode: string;
  type: string;
  generatedAt: string;
  blobUrl: string;
  student: {
    fullName: string;
    studentId: string;
    college: string;
  };
  event: {
    title: string;
    startDate: string;
    category: string;
  };
  template?: string;
  status: string;
}

async function verifyCertificate(code: string): Promise<VerifiedCert | null> {
  if (!code) return null;
  const res = await fetch(`/api/certificates/${encodeURIComponent(code)}/verify`);
  if (!res.ok) return null;
  const json = await res.json();
  return json.data?.certificate || null;
}

export default function CertificateVerificationResultPage() {
  const params = useParams();
  const rawId = (params?.verificationId as string) || '';
  const verificationId = decodeURIComponent(rawId).trim();

  const { data: cert, isLoading } = useQuery({
    queryKey: ['certificate-verify', verificationId],
    queryFn: () => verifyCertificate(verificationId),
    enabled: !!verificationId,
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-[#00A4EF] mx-auto" />
        <p className="text-sm text-slate-500">Verifying certificate credentials...</p>
      </div>
    );
  }

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
            ✓ Authenticated Official Certificate
          </Badge>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Verification Successful</h1>
          <p className="text-xs font-mono text-[#00A4EF] font-bold mt-1">ID: {cert.verificationCode}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left p-6 rounded-2xl bg-slate-50 dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] text-xs">
          <div>
            <span className="text-slate-500 dark:text-[#A8B0BB] font-semibold block">Student Recipient</span>
            <span className="text-slate-900 dark:text-white font-extrabold text-sm block mt-0.5">{cert.student.fullName}</span>
            <span className="text-slate-500 dark:text-[#A8B0BB] block mt-0.5">{cert.student.studentId} • {cert.student.college}</span>
          </div>

          <div>
            <span className="text-slate-500 dark:text-[#A8B0BB] font-semibold block">Event / Achievement</span>
            <span className="text-slate-900 dark:text-white font-extrabold text-sm block mt-0.5">{cert.event.title}</span>
            <span className="text-[#00A4EF] font-bold block mt-0.5">{cert.type} Certificate</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <span className="text-xs text-slate-500 dark:text-[#A8B0BB]">
            Issued on {formatDateDeterministic(cert.generatedAt)} by Microsoft Campus Club
          </span>

          {cert.blobUrl && (
            <a href={cert.blobUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="fluent" size="sm" onClick={() => toast.success('Downloading official PDF certificate...')}>
                <Download className="w-4 h-4" /> Download Certified PDF
              </Button>
            </a>
          )}
        </div>
      </Card>
    </div>
  );
}
