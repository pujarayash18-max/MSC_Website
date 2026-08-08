'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Sparkles, ShieldCheck, User, Mail, Lock, BookOpen, Building2, Phone, Hash, Layers } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { registerStudent } = useAuth();

  const prefillEmail = searchParams?.get('email') || searchParams?.get('prefill') || '';

  const [formData, setFormData] = useState({
    fullName: '',
    email: prefillEmail,
    enrollmentNumber: '',
    college: 'Marwadi University',
    department: 'Computer Engineering',
    year: '1st Year',
    division: 'A',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });

  useEffect(() => {
    if (prefillEmail) {
      setFormData((prev) => ({ ...prev, email: prefillEmail }));
      toast.info('Pre-filled your email for registration.');
    }
  }, [prefillEmail]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!formData.agreeTerms) {
      toast.error('Please accept the Terms & Conditions');
      return;
    }

    setIsSubmitting(true);

    const res = await registerStudent({
      fullName: formData.fullName,
      email: formData.email,
      enrollmentNumber: formData.enrollmentNumber,
      college: formData.college,
      department: formData.department,
      year: formData.year,
      division: formData.division,
      phone: formData.phone,
      password: formData.password,
    });

    setIsSubmitting(false);

    if (res.success) {
      toast.success(res.message || 'MCC Account Created Successfully!');
      router.push('/dashboard');
    } else {
      toast.error(res.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center space-y-3">
          <Badge variant="primary">MCC Student Account (§11, §12)</Badge>
          <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
            Create Your MCC Account
          </h1>
          <p className="text-sm text-slate-400">
            Join Microsoft Campus Club at Marwadi University to earn points, participate in hackathons, and receive verified certificates.
          </p>
        </div>

        <Card className="p-8 border-slate-800 bg-slate-900/80 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-sky-400" /> Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Rahul Sharma"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full p-3 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-sky-500 focus:outline-none placeholder-slate-500"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-sky-400" /> Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="student@marwadiuniversity.ac.in"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-3 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-sky-500 focus:outline-none placeholder-slate-500"
                />
              </div>

              {/* Enrollment Number */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-sky-400" /> Enrollment Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="92100103045"
                  value={formData.enrollmentNumber}
                  onChange={(e) => setFormData({ ...formData, enrollmentNumber: e.target.value })}
                  className="w-full p-3 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-sky-500 focus:outline-none placeholder-slate-500"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-sky-400" /> Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-3 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-sky-500 focus:outline-none placeholder-slate-500"
                />
              </div>

              {/* Department */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-sky-400" /> Department / Branch *
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full p-3 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                >
                  <option value="Computer Engineering">Computer Engineering</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="AI & Machine Learning">AI & Machine Learning</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Electronics & Communication">Electronics & Communication</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                </select>
              </div>

              {/* Academic Year */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-sky-400" /> Academic Year *
                </label>
                <select
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="w-full p-3 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-sky-400" /> Password *
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full p-3 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-sky-500 focus:outline-none placeholder-slate-500"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-sky-400" /> Confirm Password *
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full p-3 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-sky-500 focus:outline-none placeholder-slate-500"
                />
              </div>
            </div>

            {/* Terms checkbox */}
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="terms"
                checked={formData.agreeTerms}
                onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                className="rounded border-slate-800 bg-slate-950 text-sky-500 focus:ring-sky-500"
              />
              <label htmlFor="terms" className="text-xs text-slate-400 cursor-pointer">
                I agree to the <span className="text-sky-400 underline">MCC Platform Terms of Service</span> & Privacy Policy.
              </label>
            </div>

            <Button
              type="submit"
              variant="fluent"
              disabled={isSubmitting}
              className="w-full justify-center text-sm py-3 font-bold"
            >
              <Sparkles className="w-4 h-4" />
              {isSubmitting ? 'Generating MCC Student ID...' : 'Create Account & Generate MCC Student ID'}
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            Already have an MCC account?{' '}
            <Link href="/login" className="text-sky-400 font-semibold hover:underline">
              Sign In
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
