'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { INITIAL_EVENTS } from '@/lib/services/dataService';
import { toast } from 'sonner';
import { Trophy, Award, Zap, CheckCircle2, Send } from 'lucide-react';

export default function AdminWinnersPage() {
  const [selectedEventId, setSelectedEventId] = useState(INITIAL_EVENTS[0].eventId);
  const [firstPlace, setFirstPlace] = useState('Rahul Sharma (92100103045)');
  const [secondPlace, setSecondPlace] = useState('Ananya Verma (92100103099)');
  const [thirdPlace, setThirdPlace] = useState('Vikram Singh (92100103112)');
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublishWinners = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPublishing(true);

    setTimeout(() => {
      setIsPublishing(false);
      toast.success(
        'Winner Cascade Executed! Points credited, achievements unlocked, and notifications broadcasted.'
      );
    }, 800);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Trophy className="w-7 h-7 text-[#FFB900]" /> Winner Management & Cascade Engine
        </h1>
        <p className="text-sm text-slate-600 dark:text-[#A8B0BB] mt-1">
          Publishing winners automatically awards points, unlocks badges, updates the leaderboard, and generates certificates.
        </p>
      </div>

      <Card className="p-6 space-y-6 border-slate-200 dark:border-[#2A323D]">
        <form onSubmit={handlePublishWinners} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-[#F5F7FA] block mb-1">Select Event *</label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full p-2.5 text-xs bg-white dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A4EF] focus:outline-none"
            >
              {INITIAL_EVENTS.map((evt) => (
                <option key={evt.eventId} value={evt.eventId}>
                  {evt.title} ({evt.category})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
              <span className="text-xs font-bold text-[#FFB900]">🥇 1st Place Champion (+100 pts)</span>
              <input
                type="text"
                required
                value={firstPlace}
                onChange={(e) => setFirstPlace(e.target.value)}
                className="w-full p-2 text-xs bg-white dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] rounded-lg text-slate-900 dark:text-white"
              />
            </div>

            <div className="p-4 rounded-2xl bg-slate-500/10 border border-slate-400/30 space-y-2">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">🥈 2nd Place Runner-Up (+80 pts)</span>
              <input
                type="text"
                required
                value={secondPlace}
                onChange={(e) => setSecondPlace(e.target.value)}
                className="w-full p-2 text-xs bg-white dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] rounded-lg text-slate-900 dark:text-white"
              />
            </div>

            <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/30 space-y-2">
              <span className="text-xs font-bold text-[#F25022]">🥉 3rd Place Finalist (+50 pts)</span>
              <input
                type="text"
                required
                value={thirdPlace}
                onChange={(e) => setThirdPlace(e.target.value)}
                className="w-full p-2 text-xs bg-white dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] rounded-lg text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button type="submit" variant="fluent" size="lg" disabled={isPublishing}>
              <Send className="w-4 h-4" /> {isPublishing ? 'Executing Cascade...' : 'Publish Winners & Cascade Points'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
