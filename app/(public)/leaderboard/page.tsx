'use client';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown } from 'lucide-react';

const MOCK_LEADERBOARD = [
  { rank: 1, name: 'Rahul Sharma', points: 340, college: 'Marwadi University', dept: 'CE (3rd Year)', badges: 5, events: 4, won: 2, photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
  { rank: 2, name: 'Ananya Verma', points: 280, college: 'Marwadi University', dept: 'IT (3rd Year)', badges: 4, events: 4, won: 1, photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' },
  { rank: 3, name: 'Vikram Singh', points: 230, college: 'Marwadi University', dept: 'CE (2nd Year)', badges: 3, events: 3, won: 1, photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
  { rank: 4, name: 'Neha Patel', points: 190, college: 'Marwadi University', dept: 'AI & ML (2nd Year)', badges: 3, events: 3, won: 0, photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80' },
  { rank: 5, name: 'Karan Shah', points: 150, college: 'Marwadi University', dept: 'Data Science (3rd Year)', badges: 2, events: 2, won: 0, photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' }
];

export default function PublicLeaderboardPage() {
  const [period, setPeriod] = useState<'Overall' | 'Monthly' | 'Semester' | 'Academic Year'>('Overall');

  const top3 = MOCK_LEADERBOARD.slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 py-8">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <Badge variant="primary">Community Rankings (§26, §54)</Badge>
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">Community Leaderboard</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">Recognizing student excellence, workshop participation, and hackathon achievements.</p>

        {/* Period Filters */}
        <div className="flex justify-center gap-2 pt-2">
          {(['Overall', 'Monthly', 'Semester', 'Academic Year'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                period === p
                  ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/25'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 Podium Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-end">
        {/* 2nd Place */}
        <Card className="p-6 text-center space-y-3 border-slate-300 dark:border-slate-700 bg-gradient-to-b from-white to-slate-100 dark:from-slate-900 dark:to-slate-950 shadow-xl order-2 md:order-1">
          <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-400/20 border border-slate-400 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-center mx-auto">
            #2
          </div>
          <img src={top3[1].photo} alt={top3[1].name} className="w-20 h-20 rounded-2xl object-cover mx-auto border-2 border-slate-400 shadow-lg" />
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{top3[1].name}</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">{top3[1].dept}</p>
          </div>
          <Badge variant="primary" className="text-sm font-extrabold">{top3[1].points} pts</Badge>
        </Card>

        {/* 1st Place Champion */}
        <Card className="p-8 text-center space-y-4 border-amber-500/50 bg-gradient-to-b from-amber-50 via-white to-amber-50 dark:from-slate-900 dark:via-amber-950/20 dark:to-slate-950 shadow-2xl scale-105 order-1 md:order-2">
          <Crown className="w-10 h-10 text-amber-500 dark:text-amber-400 mx-auto animate-bounce" />
          <img src={top3[0].photo} alt={top3[0].name} className="w-24 h-24 rounded-2xl object-cover mx-auto border-4 border-amber-400 shadow-xl" />
          <div>
            <Badge variant="warning" className="mb-1 font-bold">🥇 1st Champion</Badge>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">{top3[0].name}</h3>
            <p className="text-xs text-amber-600 dark:text-amber-300 font-semibold">{top3[0].dept}</p>
          </div>
          <div className="text-2xl font-black text-amber-500 dark:text-amber-400">{top3[0].points} pts</div>
        </Card>

        {/* 3rd Place */}
        <Card className="p-6 text-center space-y-3 border-orange-300 dark:border-orange-500/30 bg-gradient-to-b from-white to-orange-50 dark:from-slate-900 dark:to-slate-950 shadow-xl order-3">
          <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-500/20 border border-orange-400 text-orange-600 dark:text-orange-300 font-bold flex items-center justify-center mx-auto">
            #3
          </div>
          <img src={top3[2].photo} alt={top3[2].name} className="w-20 h-20 rounded-2xl object-cover mx-auto border-2 border-orange-400 shadow-lg" />
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{top3[2].name}</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">{top3[2].dept}</p>
          </div>
          <Badge variant="danger" className="text-sm font-extrabold">{top3[2].points} pts</Badge>
        </Card>
      </div>

      {/* Leaderboard Table for Remaining Ranks */}
      <Card className="max-w-5xl mx-auto p-6 space-y-4 border-slate-200 dark:border-slate-800">
        <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3">Ranked Student Members</h3>
        <div className="space-y-3">
          {MOCK_LEADERBOARD.map((item) => (
            <div key={item.rank} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
              <div className="flex items-center gap-4">
                <span className="w-8 text-center font-extrabold text-slate-500 dark:text-slate-400 text-sm">#{item.rank}</span>
                <img src={item.photo} alt={item.name} className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{item.name}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{item.dept} • {item.college}</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right text-xs">
                  <span className="text-slate-600 dark:text-slate-400">Badges: <strong className="text-purple-600 dark:text-purple-400">{item.badges}</strong></span>
                  <p className="text-slate-600 dark:text-slate-400">Events Won: <strong className="text-emerald-600 dark:text-emerald-400">{item.won}</strong></p>
                </div>
                <Badge variant="primary" className="text-sm font-bold">{item.points} pts</Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
