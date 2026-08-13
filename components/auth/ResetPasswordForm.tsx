'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Lock, ShieldCheck, CheckCircle2, AlertTriangle } from 'lucide-react';
import { MicrosoftFourSquareIcon } from '@/components/icons';

export function ResetPasswordForm() {
  const params = useParams();
  const searchParams = useSearchParams();

  // Extract token from either route params ([token]) or query params (?token=xyz)
  const token = (params?.token as string) || searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error('Invalid or missing password reset token.');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: newPassword }),
      });

      const json = await res.json();

      if (res.ok && (json.success || json.data?.message)) {
        setIsDone(true);
        toast.success(json.data?.message || 'Your password has been reset successfully!');
      } else {
        const msg = json.error?.message || json.message || json.error || 'Failed to reset password.';
        toast.error(msg);
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-mesh py-12">
      <Card className="max-w-md w-full p-2 relative overflow-hidden border-sky-500/20 shadow-2xl">
        <div className="text-center p-6 pb-2 space-y-2">
          <div className="p-3 rounded-2xl bg-slate-100 dark:bg-[#151B23] border border-slate-200 dark:border-[#2A323D] w-fit mx-auto shadow-md">
            <MicrosoftFourSquareIcon className="w-8 h-8" />
          </div>
          <Badge variant="primary" className="mx-auto">Secure Account Recovery</Badge>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Create New Password</h1>
          <p className="text-xs text-slate-600 dark:text-[#A8B0BB]">
            Enter a strong new password for your Microsoft Campus Club account.
          </p>
        </div>

        <div className="p-6 pt-2">
          {!token ? (
            <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-4">
              <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto" />
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Missing Reset Token</h3>
                <p className="text-xs text-slate-600 dark:text-[#A8B0BB] mt-1">
                  The password recovery token is missing or invalid. Please request a new recovery link.
                </p>
              </div>
              <Link href="/forgot-password">
                <Button variant="fluent" size="sm" className="w-full justify-center">
                  Request New Recovery Link
                </Button>
              </Link>
            </div>
          ) : isDone ? (
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-[#7FBA00] mx-auto animate-bounce" />
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Password Reset Complete!</h2>
                <p className="text-xs text-slate-600 dark:text-[#A8B0BB] mt-1">
                  Your password has been successfully updated. You can now sign in with your new password.
                </p>
              </div>
              <Link href="/login" className="block pt-2">
                <Button variant="fluent" size="sm" className="w-full justify-center shadow-lg shadow-sky-500/20">
                  Sign In Now
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-[#00A4EF]" /> New Password (min. 8 characters) *
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  placeholder="••••••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-3 text-xs bg-white dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A4EF] focus:outline-none placeholder-slate-400 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#00A4EF]" /> Confirm New Password *
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  placeholder="••••••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
              </Button>
            </form>
          )}
        </div>
      </Card>
    </div>
  );
}
