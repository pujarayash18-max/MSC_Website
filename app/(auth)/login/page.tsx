'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Sparkles, User, Lock, UserCheck } from 'lucide-react';
import Link from 'next/link';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams ? searchParams.get('redirect') || '/dashboard' : '/dashboard';
  const { loginStudent, user } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) {
      toast.error('Please enter your Student ID / Username or Email');
      return;
    }

    if (!password) {
      toast.error('Please enter your Password');
      return;
    }

    setIsSubmitting(true);
    const res = await loginStudent({ identifier, password });
    setIsSubmitting(false);

    if (res.success) {
      toast.success(`Signed in successfully as ${res.user?.fullName || 'Student'}! Redirecting...`);
      router.push(redirectUrl);
    } else {
      toast.error(res.message || 'No matching account found. Redirecting to Registration...');
      setTimeout(() => {
        const queryParam = identifier.includes('@')
          ? `?email=${encodeURIComponent(identifier)}`
          : `?prefill=${encodeURIComponent(identifier)}`;
        router.push(`/register${queryParam}`);
      }, 1200);
    }
  };

  const handleQuickLogin = async (studentId: string) => {
    setIdentifier(studentId);
    setPassword('password123');
    setIsSubmitting(true);
    const res = await loginStudent({ identifier: studentId, password: 'password123' });
    setIsSubmitting(false);
    if (res.success) {
      toast.success(`Logged in as ${res.user?.fullName} (${studentId})! Redirecting...`);
      router.push(redirectUrl);
    } else {
      toast.error(res.message || 'Quick login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-mesh py-12">
      <Card className="max-w-md w-full p-2 relative overflow-hidden border-sky-500/20 shadow-2xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

        <CardHeader className="text-center pb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white mx-auto mb-3 shadow-lg shadow-sky-500/30">
            <Sparkles className="w-6 h-6" />
          </div>

          <Badge variant="primary" className="mx-auto mb-2">Student Portal Sign In</Badge>
          <CardTitle className="text-2xl font-extrabold text-slate-900 dark:text-white">College Student Login</CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400 text-xs">
            Sign in using your Student ID / Username or Email address and Password.
          </CardDescription>

          {redirectUrl.includes('resources') && (
            <div className="mt-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs text-center font-medium">
              🔒 Sign in required to access student event resources.
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-5 pt-2">
          {/* Quick Demo Student Sign In Buttons */}
          <div className="p-3 rounded-xl bg-sky-50 dark:bg-[#151B23] border border-sky-200 dark:border-[#2A323D] space-y-2">
            <span className="text-[11px] font-bold text-sky-800 dark:text-sky-300 block">
              ⚡ Quick Demo Student Accounts:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs justify-start gap-1.5 py-1.5"
                onClick={() => handleQuickLogin('MCC-2026-00042')}
              >
                <UserCheck className="w-3.5 h-3.5 text-sky-500" />
                <span className="truncate">Rahul S. (00042)</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs justify-start gap-1.5 py-1.5"
                onClick={() => handleQuickLogin('MCC-2026-00043')}
              >
                <UserCheck className="w-3.5 h-3.5 text-purple-500" />
                <span className="truncate">Ananya V. (00043)</span>
              </Button>
            </div>
          </div>

          <form onSubmit={handleStudentLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" /> Student ID / Username / Email *
              </label>
              <input
                type="text"
                required
                placeholder="MCC-2026-00042 or student@college.edu.in"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full p-3 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none placeholder-slate-400 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" /> Password *
              </label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none placeholder-slate-400 shadow-sm"
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-sky-600 dark:text-sky-500 focus:ring-sky-500"
                />
                Remember me
              </label>

              <Link href="/forgot-password" className="text-sky-600 dark:text-sky-400 hover:underline">
                Forgot Password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="fluent"
              size="lg"
              disabled={isSubmitting}
              className="w-full justify-center py-3 font-bold text-xs"
            >
              {isSubmitting ? 'Authenticating...' : 'Sign In with ID & Password'}
            </Button>
          </form>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 font-medium">
              <span>Account Status:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{user ? `Logged in as ${user.fullName}` : 'Guest'}</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-[11px]">
              Don&apos;t have a Student Account?{' '}
              <Link href="/register" className="text-sky-600 dark:text-sky-400 font-bold hover:underline">
                Register Account & Get Student ID
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center p-4">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
