'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { MicrosoftFourSquareIcon } from '@/components/icons';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      toast.success('Password reset link sent to your college email!');
    }, 600);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-mesh py-12">
      <Card className="max-w-md w-full p-2 relative overflow-hidden border-sky-500/20 shadow-2xl">
        <CardHeader className="text-center pb-2">
          <div className="p-3 rounded-2xl bg-slate-100 dark:bg-[#151B23] border border-slate-200 dark:border-[#2A323D] w-fit mx-auto mb-3 shadow-md">
            <MicrosoftFourSquareIcon className="w-8 h-8" />
          </div>
          <Badge variant="primary" className="mx-auto mb-2">Account Recovery</Badge>
          <CardTitle className="text-2xl font-extrabold text-slate-900 dark:text-white">Reset Password</CardTitle>
          <CardDescription className="text-slate-600 dark:text-[#A8B0BB] text-xs">
            Enter your registered MCC college email address to receive password recovery instructions.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-4">
          {submitted ? (
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-[#7FBA00] mx-auto animate-bounce" />
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Reset Link Dispatched</h3>
                <p className="text-xs text-slate-600 dark:text-[#A8B0BB] mt-1">
                  We&apos;ve sent password reset instructions to <strong className="text-slate-900 dark:text-white">{email}</strong>.
                </p>
              </div>

              <Link href="/login" className="block pt-2">
                <Button variant="fluent" size="sm" className="w-full">
                  <ArrowLeft className="w-4 h-4" /> Return to Login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-[#00A4EF]" /> College Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="student@marwadiuniversity.ac.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 text-xs bg-white dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A4EF] focus:outline-none placeholder-slate-400 shadow-sm"
                />
              </div>

              <Button
                type="submit"
                variant="fluent"
                size="lg"
                disabled={isSubmitting}
                className="w-full justify-center py-3 font-bold text-xs"
              >
                {isSubmitting ? 'Sending Recovery Link...' : 'Send Recovery Email'}
              </Button>
            </form>
          )}

          <div className="pt-2 text-center text-xs">
            <Link href="/login" className="text-[#0078D4] dark:text-[#00A4EF] font-bold hover:underline inline-flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" /> Back to Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
