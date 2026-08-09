'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Lock, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function ResetPasswordPage() {

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isDone, setIsDone] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsDone(true);
    toast.success('Your password has been reset successfully!');
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <Badge variant="primary">Secure Password Reset</Badge>
          <h1 className="text-2xl font-extrabold text-white">Create New Password</h1>
        </div>

        <Card className="p-8 border-slate-800 bg-slate-900/80 shadow-2xl">
          {isDone ? (
            <div className="text-center space-y-4 py-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h2 className="text-base font-bold text-white">Password Updated!</h2>
              <p className="text-xs text-slate-400">
                You can now log in using your new credentials.
              </p>
              <Link href="/login">
                <Button variant="fluent" size="sm" className="w-full justify-center mt-2">
                  Sign In Now
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-sky-400" /> New Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-3 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-sky-400" /> Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-3 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <Button type="submit" variant="fluent" className="w-full justify-center text-xs py-3 font-bold">
                Reset Password
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
