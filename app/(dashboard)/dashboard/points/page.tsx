'use client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { Zap, Trophy, TrendingUp, Calendar, CheckCircle } from 'lucide-react';

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
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <Zap className="w-7 h-7 text-amber-400" /> Community Points Ledger (§51)
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Track your earned community points, semester totals, and point transaction audit history.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 text-center border-amber-500/30">
          <Zap className="w-8 h-8 text-amber-400 mx-auto mb-2" />
          <p className="text-xs uppercase font-semibold text-slate-400">Total Points</p>
          <h3 className="text-3xl font-extrabold text-white mt-1">{user?.communityPoints} pts</h3>
          <p className="text-xs text-amber-400 mt-1 font-medium">Lifetime Total</p>
        </Card>

        <Card className="p-6 text-center">
          <p className="text-xs uppercase font-semibold text-slate-400">This Semester</p>
          <h3 className="text-3xl font-extrabold text-white mt-1">140 pts</h3>
          <p className="text-xs text-emerald-400 mt-1">Fall Semester 2026</p>
        </Card>

        <Card className="p-6 text-center">
          <p className="text-xs uppercase font-semibold text-slate-400">Overall Rank</p>
          <h3 className="text-3xl font-extrabold text-white mt-1">#{user?.currentRank}</h3>
          <p className="text-xs text-sky-400 mt-1">Leaderboard Champion</p>
        </Card>

        <Card className="p-6 text-center">
          <p className="text-xs uppercase font-semibold text-slate-400">Badges Unlocked</p>
          <h3 className="text-3xl font-extrabold text-white mt-1">5 Badges</h3>
          <p className="text-xs text-purple-400 mt-1">Achievements Earned</p>
        </Card>
      </div>

      {/* Transaction Ledger Table */}
      <Card className="p-6 space-y-4 border-slate-800">
        <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">Point Activity History</h3>

        <div className="space-y-3">
          {MOCK_POINTS_LEDGER.map((pt) => (
            <div key={pt.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-white">{pt.event}</h4>
                <p className="text-[11px] text-slate-400">{pt.reason} • {pt.date}</p>
              </div>

              <div className="text-right">
                <span className="text-sm font-extrabold text-amber-400">+{pt.points} pts</span>
                <p className="text-[10px] text-emerald-400 font-semibold">Credited</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
