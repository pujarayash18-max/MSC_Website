'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { BarChart3, RefreshCw, Plus, Zap, ShieldCheck, Loader2, Award, RotateCcw } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

async function fetchLeaderboardStudents() {
  const res = await fetch('/api/points?mode=leaderboard', {
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
    },
  });
  if (!res.ok) return [];
  const json = await res.json();
  return json.data?.leaderboard || [];
}

export default function AdminLeaderboardPage() {
  const queryClient = useQueryClient();
  const { data: students = [], isLoading } = useQuery({
    queryKey: ['admin-leaderboard-students'],
    queryFn: fetchLeaderboardStudents,
  });

  const [studentEmail, setStudentEmail] = useState('');
  const [studentFullName, setStudentFullName] = useState('');
  const [bonusPoints, setBonusPoints] = useState(50);
  const [reason, setReason] = useState('Hackathon Mentor Bonus');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [awardingStudentId, setAwardingStudentId] = useState<string | null>(null);

  const handleSelectStudent = (studentId: string) => {
    const s = students.find((item: any) => item.id === studentId);
    if (s) {
      setStudentFullName(s.fullName || '');
      setStudentEmail(s.email || `${s.fullName.toLowerCase().replace(/\s+/g, '.')}@marwadiuniversity.ac.in`);
    }
  };

  const handleRecalculate = async (mode: 'reset' | 'recalculate' = 'reset') => {
    setIsRecalculating(true);
    try {
      const res = await fetch(`/api/leaderboard/recalculate?mode=${mode}`, {
        method: 'POST',
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success(json.data?.message || 'Leaderboard student points & ranks reset to 0!');
        queryClient.invalidateQueries({ queryKey: ['public-community-leaderboard'] });
        queryClient.invalidateQueries({ queryKey: ['admin-leaderboard-students'] });
      } else {
        toast.error('Reset Failed', { description: json.error });
      }
    } catch {
      toast.error('Network error resetting leaderboard.');
    } finally {
      setIsRecalculating(false);
    }
  };

  const handleQuickAward = async (student: any, pointsAmount: number) => {
    setAwardingStudentId(student.id);
    try {
      const res = await fetch('/api/leaderboard/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId: student.id,
          fullName: student.fullName,
          email: student.email,
          points: pointsAmount,
          reason: `Admin Award: +${pointsAmount} Pts`,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        toast.success(`+${pointsAmount} points credited to ${student.fullName}! New Total: ${json.data?.student?.communityPoints || student.communityPoints + pointsAmount} pts`);
        queryClient.invalidateQueries({ queryKey: ['public-community-leaderboard'] });
        queryClient.invalidateQueries({ queryKey: ['admin-leaderboard-students'] });
      } else {
        toast.error('Failed to award points', { description: json.error });
      }
    } catch {
      toast.error('Network error awarding bonus points.');
    } finally {
      setAwardingStudentId(null);
    }
  };

  const handleAwardBonus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentFullName.trim()) {
      toast.error('Verification Error: Student Full Name is required.');
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
        toast.success(json.data?.message || 'Points awarded successfully!');
        queryClient.invalidateQueries({ queryKey: ['public-community-leaderboard'] });
        queryClient.invalidateQueries({ queryKey: ['admin-leaderboard-students'] });
        setStudentEmail('');
        setStudentFullName('');
      } else {
        toast.error('Point Awarding Failed', {
          description: json.error || 'Could not find matching student in database.',
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
            Recalculate student rankings, award bonus points, or reset leaderboard points to 0.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="destructive" size="sm" onClick={() => handleRecalculate('reset')} disabled={isRecalculating} className="font-bold gap-1">
            <RotateCcw className={`w-3.5 h-3.5 ${isRecalculating ? 'animate-spin' : ''}`} /> Reset Points &amp; Ranks to 0
          </Button>

          <Button variant="fluent" size="sm" onClick={() => handleRecalculate('recalculate')} disabled={isRecalculating} className="font-bold gap-1">
            <RefreshCw className={`w-3.5 h-3.5 ${isRecalculating ? 'animate-spin' : ''}`} /> Recalculate Rankings
          </Button>
        </div>
      </div>

      {/* Manual Bonus Award Form */}
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
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Quick Select Registered Student</label>
            <select
              onChange={(e) => handleSelectStudent(e.target.value)}
              className="w-full p-2.5 text-xs bg-slate-50 dark:bg-[#0D1117] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="">-- Choose Student from Leaderboard List --</option>
              {students.map((s: any) => (
                <option key={s.id} value={s.id}>
                  {s.fullName} ({s.communityPoints} pts)
                </option>
              ))}
            </select>
          </div>

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
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Student Exact Email</label>
              <input
                type="email"
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

      {/* Quick 1-Click Point Award Table */}
      <Card className="p-6 space-y-4 border-slate-200 dark:border-[#2A323D] bg-white dark:bg-[#151B23]">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#2A323D] pb-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-[#7FBA00]" /> Registered Students &amp; 1-Click Point Award
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">Instant database point credit</span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-[#00A4EF]" />
          </div>
        ) : (
          <div className="space-y-3">
            {students.map((student: any, idx: number) => (
              <div
                key={student.id}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0D1117] border border-slate-200 dark:border-[#2A323D] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 text-center text-xs font-bold text-slate-400">#{idx + 1}</span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{student.fullName}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{student.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="primary" className="text-xs font-extrabold px-3 py-1">
                    {student.communityPoints} pts
                  </Badge>

                  <Button
                    size="sm"
                    variant="outline"
                    disabled={awardingStudentId === student.id}
                    onClick={() => handleQuickAward(student, 50)}
                    className="text-xs font-bold gap-1 border-amber-500/50 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                  >
                    {awardingStudentId === student.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                    +50 Pts
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    disabled={awardingStudentId === student.id}
                    onClick={() => handleQuickAward(student, 100)}
                    className="text-xs font-bold gap-1 border-emerald-500/50 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
                  >
                    {awardingStudentId === student.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                    +100 Pts
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
