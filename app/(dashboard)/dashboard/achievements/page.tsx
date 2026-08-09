'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Award, Star, Zap, Code, ShieldCheck, CheckCircle2 } from 'lucide-react';

const ACHIEVEMENTS = [
  { id: '1', title: 'Azure Hackathon Winner', description: 'Awarded for securing 1st place in National Azure AI Hackathon 2026', icon: Trophy, earned: true, date: 'Aug 16, 2026' },
  { id: '2', title: 'Workshop Explorer', description: 'Attended 3+ technical workshops at Marwadi University', icon: Award, earned: true, date: 'Aug 25, 2026' },
  { id: '3', title: 'Azure Learner', description: 'Completed official Azure cloud serverless hands-on session', icon: Zap, earned: true, date: 'Jul 20, 2026' },
  { id: '4', title: 'GitHub Contributor', description: 'Linked open source repository and pushed project submissions', icon: Code, earned: true, date: 'Aug 11, 2026' },
  { id: '5', title: 'Community Mentor', description: 'Achieved 300+ community points and helped peer developers', icon: ShieldCheck, earned: true, date: 'Jun 30, 2026' },
  { id: '6', title: 'Hackathon Master', description: 'Participated in 5+ national hackathons (In Progress)', icon: Star, earned: false, date: 'Locked' }
];

export default function StudentAchievementsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Trophy className="w-7 h-7 text-[#00A4EF]" /> Achievement System & Badges
        </h1>
        <p className="text-sm text-slate-600 dark:text-[#A8B0BB] mt-1">
          Automatically unlocked badges as you participate in events, win competitions, and contribute to the community.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ACHIEVEMENTS.map((ach) => {
          const Icon = ach.icon;
          return (
            <Card
              key={ach.id}
              className={`p-6 space-y-4 border transition-all ${
                ach.earned
                  ? 'border-[#00A4EF]/40 bg-white dark:bg-[#151B23]'
                  : 'border-slate-200 dark:border-[#2A323D] bg-slate-50 dark:bg-[#0B0F14] opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
                    ach.earned
                      ? 'bg-[#00A4EF]/10 text-[#00A4EF] border-[#00A4EF]/30 shadow-md'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </div>

                <Badge variant={ach.earned ? 'purple' : 'outline'}>
                  {ach.earned ? 'Unlocked' : 'Locked'}
                </Badge>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{ach.title}</h3>
                <p className="text-xs text-slate-600 dark:text-[#A8B0BB] mt-1 leading-relaxed">{ach.description}</p>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-[#2A323D] flex items-center justify-between text-[11px] text-slate-500 dark:text-[#A8B0BB]">
                <span>Earned: {ach.date}</span>
                {ach.earned && <CheckCircle2 className="w-4 h-4 text-[#7FBA00]" />}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
