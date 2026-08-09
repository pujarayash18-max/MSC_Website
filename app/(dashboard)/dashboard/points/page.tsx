'use client';

import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { Zap } from 'lucide-react';

const MOCK_POINTS_LEDGER = [
  { id: 'pt_1', event: 'Azure Cloud Architecture Masterclass', points: 20, reason: 'Event Attendance via QR Check-in', date: 'Aug 25, 2026' },
  { id: 'pt_2', event: 'National Azure AI Hackathon 2026', points: 100, reason: '1st Place Hackathon Winner', date: 'Aug 16, 2026' },
  { id: 'pt_3', event: 'GitHub Open Source Bootcamp', points: 20, reason: 'Event Attendance via QR Check-in', date: 'Jul 20, 2026' },
  { id: 'pt_4', event: 'Community Peer Mentorship', points: 200, reason: 'Top Community Contributor Award', date: 'Jun 30, 2026' }
];

export default function StudentPointsPage() {
  const { user } = useAuth();

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 text-center border-slate-200 dark:border-[#2A323D]">
          <Zap className="w-8 h-8 text-[#FFB900] mx-auto mb-2" />
          <p className="text-xs uppercase font-semibold text-slate-500 dark:text-[#A8B0BB]">Total Points</p>
          <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{user?.communityPoints} pts</h3>
          <p className="text-xs text-[#FFB900] mt-1 font-medium">Lifetime Total</p>
        </Card>

        <Card className="p-6 text-center border-slate-200 dark:border-[#2A323D]">
          <p className="text-xs uppercase font-semibold text-slate-500 dark:text-[#A8B0BB]">This Semester</p>
          <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">140 pts</h3>
          <p className="text-xs text-[#7FBA00] mt-1">Fall Semester 2026</p>
        </Card>

        <Card className="p-6 text-center border-slate-200 dark:border-[#2A323D]">
          <p className="text-xs uppercase font-semibold text-slate-500 dark:text-[#A8B0BB]">Overall Rank</p>
          <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">#{user?.currentRank}</h3>
          <p className="text-xs text-[#00A4EF] mt-1">Leaderboard Champion</p>
        </Card>

        <Card className="p-6 text-center border-slate-200 dark:border-[#2A323D]">
          <p className="text-xs uppercase font-semibold text-slate-500 dark:text-[#A8B0BB]">Badges Unlocked</p>
          <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">5 Badges</h3>
          <p className="text-xs text-[#00A4EF] mt-1">Achievements Earned</p>
        </Card>
      </div>

      {/* Transaction Ledger Table */}
      <Card className="p-6 space-y-4 border-slate-200 dark:border-[#2A323D]">
        <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-[#2A323D] pb-3">Point Activity History</h3>

        <div className="space-y-3">
          {MOCK_POINTS_LEDGER.map((pt) => (
            <div key={pt.id} className="p-4 rounded-xl bg-slate-50 dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] flex items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">{pt.event}</h4>
                <p className="text-[11px] text-slate-500 dark:text-[#A8B0BB]">{pt.reason} • {pt.date}</p>
              </div>

              <div className="text-right">
                <span className="text-sm font-extrabold text-[#FFB900]">+{pt.points} pts</span>
                <p className="text-[10px] text-[#7FBA00] font-semibold">Credited</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
