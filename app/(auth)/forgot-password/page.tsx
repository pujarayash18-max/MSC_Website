'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Mail, ArrowLeft, CheckCircle2, RefreshCw, KeyRound, ExternalLink } from 'lucide-react';
import { MicrosoftFourSquareIcon } from '@/components/icons';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();

      if (res.ok && (json.success || json.exists)) {
        setSubmitted(true);
        const resetLink = json.data?.devResetUrl || json.devResetUrl;
        if (resetLink) setDevResetUrl(resetLink);
        toast.success(json.message || json.data?.message || 'If an account exists with this email, a reset link will be sent.');
      } else {
        const errorMsg = json.error?.message || json.message || json.error || 'Failed to send recovery email.';
        toast.error(errorMsg);
      }
    } catch {
      toast.error('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
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
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Reset Link Dispatched</h3>
                <p className="text-xs text-slate-600 dark:text-[#A8B0BB]">
                  If an account exists for <strong className="text-slate-900 dark:text-white">{email}</strong>, a password reset link will be sent to your inbox.
                </p>
              </div>

              {/* Dev Only Direct Reset Link */}
              {devResetUrl && (
                <div className="p-3 bg-slate-900/90 border border-sky-500/30 rounded-xl text-left space-y-1">
                  <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block">
                    Direct Reset Link (Local Testing):
                  </span>
                  <a
                    href={devResetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-sky-300 underline break-all flex items-center gap-1 hover:text-sky-200"
                  >
                    <KeyRound className="w-3.5 h-3.5 shrink-0" /> Open Reset Password Page <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              <div className="flex flex-col gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isSubmitting}
                  onClick={() => handleSubmit()}
                  className="w-full text-xs font-semibold"
                >
                  <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isSubmitting ? 'animate-spin' : ''}`} />
                  Resend Recovery Email
                </Button>

                <Link href="/login" className="block w-full">
                  <Button variant="fluent" size="sm" className="w-full text-xs">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Return to Login
                  </Button>
                </Link>
              </div>
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
                className="w-full justify-center py-3 font-bold text-xs shadow-lg shadow-sky-500/20"
              >
                {isSubmitting ? 'Sending Recovery Link...' : 'Send Recovery Email'}
              </Button>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-sky-500 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
