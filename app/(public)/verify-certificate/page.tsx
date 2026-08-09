'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, ShieldCheck } from 'lucide-react';

export default function VerifyCertificateSearchPage() {
  const [verificationId, setVerificationId] = useState('');
  const router = useRouter();

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationId) return;
    router.push(`/verify-certificate/${verificationId.trim()}`);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-6">
      <div className="w-16 h-16 rounded-3xl bg-[#7FBA00]/10 border border-[#7FBA00]/30 text-[#7FBA00] flex items-center justify-center mx-auto shadow-xl">
        <ShieldCheck className="w-8 h-8" />
      </div>

      <div>
        <Badge variant="success" className="mb-2">Credential Verification Engine (§50)</Badge>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Verify MCC Certificate</h1>
        <p className="text-sm text-slate-600 dark:text-[#A8B0BB] mt-2">
          Enter the unique credential verification ID found at the bottom of any Microsoft Campus Club certificate to validate authenticity.
        </p>
      </div>

      <Card className="p-8 border-slate-200 dark:border-[#2A323D]">
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-[#F5F7FA] block text-left mb-1">Unique Certificate Verification ID</label>
            <input
              type="text"
              required
              value={verificationId}
              onChange={(e) => setVerificationId(e.target.value)}
              placeholder="e.g. MCC-CERT-2026-AZ8801"
              className="w-full p-3.5 text-sm bg-white dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white font-mono text-center focus:ring-2 focus:ring-[#00A4EF] focus:outline-none"
            />
          </div>

          <Button type="submit" variant="fluent" size="lg" className="w-full">
            <Search className="w-4 h-4" /> Verify Credentials
          </Button>
        </form>
      </Card>
    </div>
  );
}
