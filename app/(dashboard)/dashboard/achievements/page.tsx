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
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <Trophy className="w-7 h-7 text-purple-400" /> Achievement System & Badges (§52)
        </h1>
        <p className="text-sm text-slate-400 mt-1">
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
                  ? 'border-purple-500/40 bg-gradient-to-b from-slate-900 to-purple-950/20'
                  : 'border-slate-800 bg-slate-950/60 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
                    ach.earned
                      ? 'bg-purple-500/20 text-purple-400 border-purple-500/40 shadow-lg shadow-purple-500/20'
                      : 'bg-slate-900 text-slate-600 border-slate-800'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </div>

                <Badge variant={ach.earned ? 'purple' : 'outline'}>
                  {ach.earned ? 'Unlocked' : 'Locked'}
                </Badge>
              </div>

              <div>
                <h3 className="text-base font-bold text-white">{ach.title}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{ach.description}</p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                <span>Earned: {ach.date}</span>
                {ach.earned && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
