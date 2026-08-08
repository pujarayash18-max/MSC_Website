'use client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';
import { GithubIcon } from '@/components/icons';
import Link from 'next/link';

export default function LoginPage() {
  const { login, user } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-mesh">
      <Card className="max-w-md w-full p-2 relative overflow-hidden border-sky-500/20 shadow-2xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

        <CardHeader className="text-center pb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white mx-auto mb-3 shadow-lg shadow-sky-500/30">
            <Sparkles className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-extrabold text-white">Welcome Back</CardTitle>
          <CardDescription className="text-slate-400">
            Sign in to access student dashboard, event registrations & certificates
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-4">
          <Button
            variant="fluent"
            size="lg"
            className="w-full flex items-center justify-center gap-3 py-3"
            onClick={() => login('aad')}
          >
            <ShieldCheck className="w-5 h-5" />
            <span>Sign in with Microsoft Entra ID</span>
          </Button>

          <Button
            variant="secondary"
            size="lg"
            className="w-full flex items-center justify-center gap-3 py-3"
            onClick={() => login('github')}
          >
            <GithubIcon className="w-5 h-5" />
            <span>Sign in with GitHub</span>
          </Button>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-900 px-2 text-slate-500 font-medium">Quick Demo Access</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-300 font-medium">
              <span>Current Status:</span>
              <span className="text-emerald-400 font-semibold">{user ? `Logged in as ${user.fullName}` : 'Logged Out'}</span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Local dev mode automatically provides pre-authenticated mock identity with full Super Admin access.
            </p>
            <Link href="/dashboard" className="block pt-1">
              <Button variant="outline" size="sm" className="w-full text-xs">
                Go directly to Student Dashboard <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
