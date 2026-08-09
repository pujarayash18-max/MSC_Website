'use client';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { BarChart3, RefreshCw, Plus, Zap } from 'lucide-react';

export default function AdminLeaderboardPage() {
  const [studentName, setStudentName] = useState('');
  const [bonusPoints, setBonusPoints] = useState(50);
  const [reason, setReason] = useState('Hackathon Mentor Bonus');
  const [isRecalculating, setIsRecalculating] = useState(false);

  const handleRecalculate = () => {
    setIsRecalculating(true);
    setTimeout(() => {
      setIsRecalculating(false);
      toast.success('Community Leaderboard Rankings Recalculated Successfully!');
    }, 800);
  };

  const handleAwardBonus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName) return;
    toast.success(`Awarded +${bonusPoints} bonus points to ${studentName}!`);
    setStudentName('');
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-[#0078D4] dark:text-[#00A4EF]" /> Leaderboard Management
          </h1>
          <p className="text-sm text-slate-600 dark:text-[#A8B0BB] mt-1">
            Recalculate student rankings, award bonus points, and adjust point ledgers.
          </p>
        </div>

        <Button variant="fluent" size="sm" onClick={handleRecalculate} isLoading={isRecalculating}>
          <RefreshCw className="w-4 h-4" /> Recalculate Rankings
        </Button>
      </div>

      <Card className="p-6 space-y-4 border-slate-200 dark:border-[#2A323D] bg-white dark:bg-[#151B23]">
        <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-[#2A323D] pb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" /> Award Bonus Points
        </h3>

        <form onSubmit={handleAwardBonus} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Student Name / Email *</label>
              <input
                type="text"
                required
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Rahul Sharma"
                className="w-full p-2.5 text-xs bg-slate-50 dark:bg-[#0D1117] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0078D4] dark:focus:ring-[#00A4EF] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Bonus Points Amount</label>
              <input
                type="number"
                value={bonusPoints}
                onChange={(e) => setBonusPoints(Number(e.target.value))}
                className="w-full p-2.5 text-xs bg-slate-50 dark:bg-[#0D1117] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0078D4] dark:focus:ring-[#00A4EF] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Reason / Category</label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-2.5 text-xs bg-slate-50 dark:bg-[#0D1117] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0078D4] dark:focus:ring-[#00A4EF] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" variant="fluent" size="sm">
              <Plus className="w-4 h-4" /> Award Bonus Points
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
