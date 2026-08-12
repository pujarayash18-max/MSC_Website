'use client';

import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { Zap, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface LedgerItem {
  id: string;
  reason: string;
  points: number;
  awardedAt: string;
  eventId?: string | null;
}

async function fetchPointsHistory(): Promise<LedgerItem[]> {
  const res = await fetch('/api/points?mode=history');
  if (!res.ok) return [];
  const json = await res.json();
  return json.data?.ledger || [];
}

export default function StudentPointsPage() {
  const { user } = useAuth();

  const { data: ledger = [], isLoading } = useQuery({
    queryKey: ['student-points-ledger'],
    queryFn: fetchPointsHistory,
  });

  const totalPoints = user?.communityPoints ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Zap className="w-7 h-7 text-[#FFB900]" /> Community Points Ledger
        </h1>
        <p className="text-sm text-slate-600 dark:text-[#A8B0BB] mt-1">
          Track your earned community points, semester totals, and point transaction audit history.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 text-center border-slate-200 dark:border-[#2A323D]">
          <Zap className="w-8 h-8 text-[#FFB900] mx-auto mb-2" />
          <p className="text-xs uppercase font-semibold text-slate-500 dark:text-[#A8B0BB]">Total Points</p>
          <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{totalPoints} pts</h3>
          <p className="text-xs text-[#FFB900] mt-1 font-medium">Lifetime Total</p>
        </Card>

        <Card className="p-6 text-center border-slate-200 dark:border-[#2A323D]">
          <p className="text-xs uppercase font-semibold text-slate-500 dark:text-[#A8B0BB]">Overall Rank</p>
          <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            {user?.currentRank && user.currentRank < 9999 ? `#${user.currentRank}` : 'Unranked'}
          </h3>
          <p className="text-xs text-[#00A4EF] mt-1">Leaderboard Status</p>
        </Card>

        <Card className="p-6 text-center border-slate-200 dark:border-[#2A323D]">
          <p className="text-xs uppercase font-semibold text-slate-500 dark:text-[#A8B0BB]">Total Activities Logged</p>
          <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{ledger.length}</h3>
          <p className="text-xs text-[#7FBA00] mt-1">Events &amp; Feedback Submissions</p>
        </Card>
      </div>

      {/* Transaction Ledger Table */}
      <Card className="p-6 space-y-4 border-slate-200 dark:border-[#2A323D]">
        <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-[#2A323D] pb-3">Point Activity History</h3>

        {isLoading ? (
          <div className="flex items-center justify-center py-8 text-slate-500 dark:text-[#A8B0BB] gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-[#00A4EF]" />
            <span className="text-xs font-medium">Loading point transaction ledger…</span>
          </div>
        ) : ledger.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 dark:text-[#A8B0BB]">
            No point transactions recorded yet. Submit event feedback or attend workshops to earn points!
          </div>
        ) : (
          <div className="space-y-3">
            {ledger.map((pt) => (
              <div key={pt.id} className="p-4 rounded-xl bg-slate-50 dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{pt.reason}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-[#A8B0BB]">
                    {new Date(pt.awardedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                <div className="text-right">
                  <span className={`text-sm font-extrabold ${pt.points >= 0 ? 'text-[#FFB900]' : 'text-rose-500'}`}>
                    {pt.points >= 0 ? `+${pt.points}` : pt.points} pts
                  </span>
                  <p className="text-[10px] text-[#7FBA00] font-semibold">Credited</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
