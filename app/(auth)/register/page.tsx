'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { User, Mail, BookOpen, Lock, Building2, GraduationCap, CheckCircle2, ArrowRight } from 'lucide-react';
import { MicrosoftFourSquareIcon } from '@/components/icons';
import Link from 'next/link';

export default function StudentRegisterPage() {
  const router = useRouter();
  const { registerStudent } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [college, setCollege] = useState('Marwadi University');
  const [customCollege, setCustomCollege] = useState('');
  const [enrollmentNumber, setEnrollmentNumber] = useState('');
  const [department, setDepartment] = useState('Computer Engineering');
  const [year, setYear] = useState('3rd Year');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredSuccess, setRegisteredSuccess] = useState(false);
  const [generatedStudentId, setGeneratedStudentId] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAccepted) {
      toast.error('Please accept the MCC Community Terms of Service.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match. Please re-enter your password.');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }

    const finalCollege = college === 'Other' ? customCollege.trim() : college;
    if (!finalCollege) {
      toast.error('Please enter your College or University name.');
      return;
    }

    setIsSubmitting(true);
    const res = await registerStudent({
      fullName,
      email,
      college: finalCollege,
      department,
      year,
      enrollmentNumber,
      password
    });
    setIsSubmitting(false);

    if (res.success && res.user) {
      setGeneratedStudentId(res.user.studentId || 'MCC-2026-REG');
      setRegisteredSuccess(true);
      toast.success(res.message || 'Account created successfully!');
    } else {
      toast.error(res.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-mesh py-12">
      <Card className="max-w-2xl w-full p-2 relative overflow-hidden border-sky-500/20 shadow-2xl">
        <div className="absolute top-0 right-0 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <CardHeader className="text-center pb-2">
          <div className="p-3 rounded-2xl bg-slate-100 dark:bg-[#151B23] border border-slate-200 dark:border-[#2A323D] w-fit mx-auto mb-3 shadow-md">
            <MicrosoftFourSquareIcon className="w-8 h-8" />
          </div>
          <Badge variant="primary" className="mx-auto mb-2">Universal Student Registration</Badge>
          <CardTitle className="text-2xl font-extrabold text-slate-900 dark:text-white">Create College Student Account</CardTitle>
          <CardDescription className="text-slate-600 dark:text-[#A8B0BB] text-xs">
            Open to all college & university students. Register to join Microsoft Campus Club bootcamps, hackathons & earn verified certificates.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5 pt-2">
          {registeredSuccess ? (
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-[#7FBA00] mx-auto animate-bounce" />
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Account Created Successfully!</h3>
                <p className="text-xs text-slate-600 dark:text-[#A8B0BB] mt-1">
                  Welcome to Microsoft Campus Club, <strong className="text-slate-900 dark:text-white">{fullName}</strong>!
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-[#151B23] border border-slate-200 dark:border-[#2A323D] text-left space-y-2.5 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-[#2A323D]">
                  <span className="text-slate-500 font-semibold">Your Unique Student ID / Username:</span>
                  <span className="font-extrabold font-mono text-base text-[#00A4EF]">{generatedStudentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Full Name:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">College / University:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{college === 'Other' ? customCollege : college}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Department / Year:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{department} • {year}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Email:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{email}</span>
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
                {/* Full Name */}
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

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-[#00A4EF]" /> Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="student@college.edu.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2.5 text-xs bg-white dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A4EF] focus:outline-none placeholder-slate-400 shadow-sm"
                  />
                </div>

                {/* College / University */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-[#00A4EF]" /> College / University *
                  </label>
                  <select
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    className="w-full p-2.5 text-xs bg-white dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A4EF] focus:outline-none shadow-sm mb-1.5"
                  >
                    <option value="Marwadi University">Marwadi University</option>
                    <option value="Gujarat Technological University (GTU)">Gujarat Technological University (GTU)</option>
                    <option value="Nirma University">Nirma University</option>
                    <option value="Pandit Deendayal Energy University (PDEU)">Pandit Deendayal Energy University (PDEU)</option>
                    <option value="Parul University">Parul University</option>
                    <option value="CHARUSAT University">CHARUSAT University</option>
                    <option value="Dhirubhai Ambani Institute (DA-IICT)">DA-IICT</option>
                    <option value="Other">Other College / University</option>
                  </select>

                  {college === 'Other' && (
                    <input
                      type="text"
                      required
                      placeholder="Enter your College Name"
                      value={customCollege}
                      onChange={(e) => setCustomCollege(e.target.value)}
                      className="w-full p-2.5 text-xs bg-white dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A4EF] focus:outline-none placeholder-slate-400 shadow-sm"
                    />
                  )}
                </div>

                {/* Enrollment / Roll Number */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-[#00A4EF]" /> Enrollment / Student ID *
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

                {/* Department */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5 text-[#00A4EF]" /> Department / Stream *
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full p-2.5 text-xs bg-white dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A4EF] focus:outline-none shadow-sm"
                  >
                    <option value="Computer Engineering">Computer Engineering</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="AI & Data Science">AI & Data Science</option>
                    <option value="Electronics & Communication">Electronics & Communication</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Civil Engineering">Civil Engineering</option>
                    <option value="BCA / MCA">BCA / MCA</option>
                    <option value="B.Sc / M.Sc Computer Science">B.Sc / M.Sc Computer Science</option>
                    <option value="Business & Management">Business & Management</option>
                    <option value="Other">Other Stream</option>
                  </select>
                </div>

                {/* Year of Study */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Year of Study *</label>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full p-2.5 text-xs bg-white dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A4EF] focus:outline-none shadow-sm"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="Post Graduate">Post Graduate (M.Tech / MCA / MBA)</option>
                  </select>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-[#00A4EF]" /> Create Password *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-2.5 text-xs bg-white dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A4EF] focus:outline-none placeholder-slate-400 shadow-sm"
                  />
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-[#00A4EF]" /> Confirm Password *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-2.5 text-xs bg-white dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A4EF] focus:outline-none placeholder-slate-400 shadow-sm"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-[#A8B0BB] cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="rounded border-slate-300 dark:border-[#2A323D] bg-white dark:bg-[#0B0F14] text-[#00A4EF] focus:ring-[#00A4EF]"
                />
                I accept the MCC Student Terms of Service & Code of Conduct
              </label>

              <Button
                type="submit"
                variant="fluent"
                size="lg"
                disabled={isSubmitting}
                className="w-full justify-center py-3 font-bold text-xs"
              >
                {isSubmitting ? 'Registering Account...' : 'Register Student Account'}
              </Button>
            </form>
          )}

          <div className="pt-2 text-center text-xs text-slate-600 dark:text-[#A8B0BB]">
            Already have a Student Account?{' '}
            <Link href="/login" className="text-[#0078D4] dark:text-[#00A4EF] font-bold hover:underline">
              Sign In with ID & Password
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
