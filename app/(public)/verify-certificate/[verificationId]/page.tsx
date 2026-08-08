'use client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShieldCheck, CheckCircle2, Award, Calendar, School, ArrowLeft } from 'lucide-react';

export default function CertificateVerificationResultPage() {
  const params = useParams();
  const verificationId = (params?.verificationId as string) || 'MCC-CERT-2026-881920';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
      <Link href="/verify-certificate">
        <Button variant="outline" size="sm">
          <ArrowLeft className="w-4 h-4" /> Verify Another Certificate
        </Button>
      </Link>

      <Card className="p-8 sm:p-10 space-y-6 border-emerald-500/40 bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950/20 shadow-2xl text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
          <ShieldCheck className="w-9 h-9" />
        </div>

        <div>
          <Badge variant="success" className="mb-2 text-xs font-extrabold px-3 py-1">
            ✓ Authenticity Verified
          </Badge>
          <h1 className="text-3xl font-black text-white">Official Certificate Verified</h1>
          <p className="text-xs font-mono text-emerald-400 font-bold mt-1">Verification ID: {verificationId}</p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 text-left space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-500 font-semibold uppercase block">Student Recipient</span>
              <p className="text-sm font-bold text-white mt-0.5">Rahul Sharma</p>
              <p className="text-slate-400">Enrollment: 92100103045</p>
            </div>

            <div>
              <span className="text-slate-500 font-semibold uppercase block">Issuing Organization</span>
              <p className="text-sm font-bold text-sky-400 mt-0.5">Microsoft Campus Club (MCC)</p>
              <p className="text-slate-400">Marwadi University, Rajkot</p>
            </div>

            <div>
              <span className="text-slate-500 font-semibold uppercase block">Event Title</span>
              <p className="text-xs font-bold text-white mt-0.5">Azure Cloud Architecture & Serverless Masterclass</p>
            </div>

            <div>
              <span className="text-slate-500 font-semibold uppercase block">Issue Date</span>
              <p className="text-xs font-bold text-white mt-0.5">August 25, 2026</p>
            </div>
          </div>
        </div>

        <div className="pt-2 text-xs text-slate-400">
          This digital credential was issued by Microsoft Campus Club at Marwadi University following verified QR attendance.
        </div>
      </Card>
    </div>
  );
}
