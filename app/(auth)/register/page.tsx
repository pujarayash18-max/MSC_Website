'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Sparkles, User, Mail, BookOpen, Lock, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { MicrosoftFourSquareIcon, GithubIcon } from '@/components/icons';
import Link from 'next/link';

export default function StudentRegisterPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [enrollmentNumber, setEnrollmentNumber] = useState('');
  const [department, setDepartment] = useState('Computer Engineering');
  const [year, setYear] = useState('3rd Year');
  const [password, setPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredSuccess, setRegisteredSuccess] = useState(false);
  const [generatedStudentId, setGeneratedStudentId] = useState('');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAccepted) {
      toast.error('Please accept the MCC Community Terms of Service.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const mockId = `MCC-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
      setGeneratedStudentId(mockId);
      setRegisteredSuccess(true);
      toast.success(`Account created successfully! Your MCC Student ID is ${mockId}`);
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-mesh py-12">
      <Card className="max-w-xl w-full p-2 relative overflow-hidden border-sky-500/20 shadow-2xl">
        <div className="absolute top-0 right-0 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <CardHeader className="text-center pb-2">
          <div className="p-3 rounded-2xl bg-slate-100 dark:bg-[#151B23] border border-slate-200 dark:border-[#2A323D] w-fit mx-auto mb-3 shadow-md">
            <MicrosoftFourSquareIcon className="w-8 h-8" />
          </div>
          <Badge variant="primary" className="mx-auto mb-2">MCC Student Registration (§23)</Badge>
          <CardTitle className="text-2xl font-extrabold text-slate-900 dark:text-white">Create MCC Account</CardTitle>
          <CardDescription className="text-slate-600 dark:text-[#A8B0BB] text-xs">
            Join the Microsoft Campus Club community at Marwadi University to unlock hackathons, bootcamps & certificates.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5 pt-2">
          {registeredSuccess ? (
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-[#7FBA00] mx-auto animate-bounce" />
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Account Successfully Created!</h3>
                <p className="text-xs text-slate-600 dark:text-[#A8B0BB] mt-1">
                  Verification email sent to <strong className="text-slate-900 dark:text-white">{email}</strong>.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-[#151B23] border border-slate-200 dark:border-[#2A323D] text-left space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Your Official MCC Student ID:</span>
                  <span className="font-extrabold font-mono text-[#00A4EF]">{generatedStudentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Full Name:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Enrollment:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{enrollmentNumber}</span>
                </div>
              </div>

              <div className="pt-2 flex justify-center gap-3">
                <Button variant="fluent" size="lg" onClick={() => router.push('/dashboard')}>
                  Proceed to Student Dashboard <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-[#00A4EF]" /> Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Rahul Sharma"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full p-2.5 text-xs bg-white dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A4EF] focus:outline-none placeholder-slate-400 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-[#00A4EF]" /> College Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="student@marwadiuniversity.ac.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2.5 text-xs bg-white dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A4EF] focus:outline-none placeholder-slate-400 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-[#00A4EF]" /> Enrollment Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="92100103045"
                    value={enrollmentNumber}
                    onChange={(e) => setEnrollmentNumber(e.target.value)}
                    className="w-full p-2.5 text-xs bg-white dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A4EF] focus:outline-none placeholder-slate-400 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Department / Branch</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full p-2.5 text-xs bg-white dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A4EF] focus:outline-none shadow-sm"
                  >
                    <option value="Computer Engineering">Computer Engineering</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="AI & Machine Learning">AI & Machine Learning</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Electronics & Communication">Electronics & Communication</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-[#00A4EF]" /> Account Password *
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2.5 text-xs bg-white dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A4EF] focus:outline-none placeholder-slate-400 shadow-sm"
                />
              </div>

              <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-[#A8B0BB] cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="rounded border-slate-300 dark:border-[#2A323D] bg-white dark:bg-[#0B0F14] text-[#00A4EF] focus:ring-[#00A4EF]"
                />
                I accept the MCC Community Terms of Service & Code of Conduct
              </label>

              <Button
                type="submit"
                variant="fluent"
                size="lg"
                disabled={isSubmitting}
                className="w-full justify-center py-3 font-bold text-xs"
              >
                {isSubmitting ? 'Creating MCC Account...' : 'Register Account'}
              </Button>
            </form>
          )}

          <div className="pt-2 text-center text-xs text-slate-600 dark:text-[#A8B0BB]">
            Already have an MCC Student Account?{' '}
            <Link href="/login" className="text-[#0078D4] dark:text-[#00A4EF] font-bold hover:underline">
              Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
