'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Sparkles, ShieldCheck, User, Lock, ArrowRight } from 'lucide-react';
import { GithubIcon } from '@/components/icons';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { login, loginStudent, user } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) {
      toast.error('Please enter your MCC Student ID or Email');
      return;
    }

    setIsSubmitting(true);
    const res = await loginStudent({ identifier, password });
    setIsSubmitting(false);

    if (res.success) {
      toast.success('Signed in successfully! Welcome back.');
      router.push('/dashboard');
    } else {
      toast.error(res.message || 'No matching account found. Redirecting to Student Registration...');
      setTimeout(() => {
        const queryParam = identifier.includes('@')
          ? `?email=${encodeURIComponent(identifier)}`
          : `?prefill=${encodeURIComponent(identifier)}`;
        router.push(`/register${queryParam}`);
      }, 1200);
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
          <Badge variant="primary" className="mx-auto mb-2">MCC Student Account Sign In (§13)</Badge>
          <CardTitle className="text-2xl font-extrabold text-white">MCC Student Login</CardTitle>
          <CardDescription className="text-slate-400 text-xs">
            Enter your Student ID (e.g. MCC-2026-00042) or College Email to access your dashboard.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5 pt-4">
          <form onSubmit={handleStudentLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-sky-400" /> Student ID / Email *
              </label>
              <input
                type="text"
                required
                placeholder="MCC-2026-00042 or student@marwadiuniversity.ac.in"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full p-3 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-sky-500 focus:outline-none placeholder-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-sky-400" /> Password *
              </label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-sky-500 focus:outline-none placeholder-slate-500"
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-800 bg-slate-950 text-sky-500 focus:ring-sky-500"
                />
                Remember me
              </label>

              <Link href="/forgot-password" className="text-sky-400 hover:underline">
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
              {isSubmitting ? 'Authenticating...' : 'Sign In to Dashboard'}
            </Button>
          </form>

          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-slate-900 px-2 text-slate-500 font-medium">Or continue with external SSO</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="secondary"
              size="sm"
              className="w-full flex items-center justify-center gap-2 text-xs py-2.5"
              onClick={() => login('aad')}
            >
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              <span>Microsoft ID</span>
            </Button>

            <Button
              variant="secondary"
              size="sm"
              className="w-full flex items-center justify-center gap-2 text-xs py-2.5"
              onClick={() => login('github')}
            >
              <GithubIcon className="w-4 h-4" />
              <span>GitHub OAuth</span>
            </Button>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-300 font-medium">
              <span>Account Status:</span>
              <span className="text-emerald-400 font-semibold">{user ? `Logged in as ${user.fullName}` : 'Guest'}</span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Don't have an MCC Student Account?{' '}
              <Link href="/register" className="text-sky-400 font-bold hover:underline">
                Create Account & Get MCC ID
              </Link>
            </p>
            <Link href="/dashboard" className="block pt-1">
              <Button variant="outline" size="sm" className="w-full text-xs justify-between">
                <span>Go to Student Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
