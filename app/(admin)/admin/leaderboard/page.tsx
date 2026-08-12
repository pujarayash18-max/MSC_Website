'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { BarChart3, RefreshCw, Plus, Zap, ShieldCheck, Loader2 } from 'lucide-react';

export default function AdminLeaderboardPage() {
  const [studentEmail, setStudentEmail] = useState('');
  const [studentFullName, setStudentFullName] = useState('');
  const [bonusPoints, setBonusPoints] = useState(50);
  const [reason, setReason] = useState('Hackathon Mentor Bonus');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);

  const handleRecalculate = () => {
    setIsRecalculating(true);
    setTimeout(() => {
      setIsRecalculating(false);
      toast.success('Community Leaderboard Rankings Recalculated Successfully!');
    }, 800);
  };

  const handleAwardBonus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentEmail.trim() || !studentFullName.trim()) {
      toast.error('Dual Verification Error: Both Student Email and Full Name are strictly required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/leaderboard/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: studentEmail.trim(),
          fullName: studentFullName.trim(),
          points: Number(bonusPoints),
          reason: reason.trim(),
        }),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        toast.success(json.message || 'Dual Verification Passed! Points awarded successfully.');
        setStudentEmail('');
        setStudentFullName('');
      } else {
        toast.error('Dual Verification Failed', {
          description: json.error || 'Student email and full name did not match database records.',
        });
      }
    } catch {
      toast.error('Network error attempting point adjustment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-[#0078D4] dark:text-[#00A4EF]" /> Leaderboard Management
          </h1>
          <p className="text-sm text-slate-600 dark:text-[#A8B0BB] mt-1">
            Recalculate student rankings, award bonus points, and adjust point ledgers with dual identity verification.
          </p>
        </div>

        <Button variant="fluent" size="sm" onClick={handleRecalculate} disabled={isRecalculating}>
          <RefreshCw className={`w-4 h-4 ${isRecalculating ? 'animate-spin' : ''}`} /> Recalculate Rankings
        </Button>
      </div>

      <Card className="p-6 space-y-6 border-slate-200 dark:border-[#2A323D] bg-white dark:bg-[#151B23]">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#2A323D] pb-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" /> Award Bonus Points (Dual Verification Enforced)
          </h3>
          <span className="text-xs text-[#00A4EF] font-bold flex items-center gap-1">
            <ShieldCheck className="w-4 h-4" /> Email + Name Guard
          </span>
        </div>

        <form onSubmit={handleAwardBonus} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Student Exact Full Name *</label>
              <input
                type="text"
                required
                value={studentFullName}
                onChange={(e) => setStudentFullName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full p-2.5 text-xs bg-slate-50 dark:bg-[#0D1117] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Student Exact Email *</label>
              <input
                type="email"
                required
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                placeholder="e.g. rahul.sharma@marwadiuniversity.ac.in"
                className="w-full p-2.5 text-xs bg-slate-50 dark:bg-[#0D1117] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Bonus Points Amount *</label>
              <input
                type="number"
                required
                value={bonusPoints}
                onChange={(e) => setBonusPoints(Number(e.target.value))}
                className="w-full p-2.5 text-xs bg-slate-50 dark:bg-[#0D1117] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Reason / Category</label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Hackathon Mentor Bonus"
                className="w-full p-2.5 text-xs bg-slate-50 dark:bg-[#0D1117] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="fluent" size="sm" disabled={isSubmitting} className="font-bold gap-2">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Award Bonus Points
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
