'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Sparkles } from 'lucide-react';

export default function VerifyEmailPage() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 text-center">
        <Badge variant="success">Email Verified (§15)</Badge>
        <h1 className="text-2xl font-extrabold text-white">Account Verified Successfully</h1>

        <Card className="p-8 border-slate-800 bg-slate-900/80 shadow-2xl space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8" />
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Your college email has been verified. Your MCC Student Account is now <strong>ACTIVE</strong>.
          </p>

          <Link href="/dashboard">
            <Button variant="fluent" className="w-full justify-center text-xs py-3 font-bold">
              <Sparkles className="w-4 h-4" /> Proceed to Student Dashboard
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
