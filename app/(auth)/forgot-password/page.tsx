'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Mail, ArrowLeft, Send } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    toast.success('If an account exists with this email, password reset instructions have been sent.');
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <Badge variant="primary">Account Recovery (§16)</Badge>
          <h1 className="text-2xl font-extrabold text-white">Reset Your MCC Password</h1>
          <p className="text-xs text-slate-400">
            Enter your college email address or MCC Student ID to receive password recovery instructions.
          </p>
        </div>

        <Card className="p-8 border-slate-800 bg-slate-900/80 shadow-2xl">
          {submitted ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-12 h-12 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center justify-center mx-auto">
                <Send className="w-6 h-6" />
              </div>
              <h2 className="text-base font-bold text-white">Check Your Inbox</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                We've sent a single-use password reset link to <strong className="text-slate-200">{email}</strong>. The link expires in 15 minutes.
              </p>
              <Link href="/login">
                <Button variant="outline" size="sm" className="mt-4 w-full justify-center">
                  <ArrowLeft className="w-4 h-4" /> Return to Sign In
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-sky-400" /> College Email or MCC Student ID
                </label>
                <input
                  type="text"
                  required
                  placeholder="student@marwadiuniversity.ac.in or MCC-2026-00042"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-sky-500 focus:outline-none placeholder-slate-500"
                />
              </div>

              <Button type="submit" variant="fluent" className="w-full justify-center text-xs py-3 font-bold">
                <Send className="w-4 h-4" /> Send Reset Link
              </Button>

              <div className="text-center pt-2">
                <Link href="/login" className="text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1">
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
