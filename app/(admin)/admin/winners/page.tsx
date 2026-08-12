'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Trophy, Send, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import type { Event } from '@/types';

async function fetchEvents(): Promise<Event[]> {
  const res = await fetch('/api/events');
  if (!res.ok) return [];
  const json = await res.json();
  return json.data?.events || [];
}

export default function AdminWinnersPage() {
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['admin-events-for-winners'],
    queryFn: fetchEvents,
  });

  const [selectedEventId, setSelectedEventId] = useState('');
  const [firstPlace, setFirstPlace] = useState('Rahul Sharma (92100103045)');
  const [secondPlace, setSecondPlace] = useState('Ananya Verma (92100103099)');
  const [thirdPlace, setThirdPlace] = useState('Vikram Singh (92100103112)');
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublishWinners = async (e: React.FormEvent) => {
    e.preventDefault();
    const eventId = selectedEventId || events[0]?.id;
    if (!eventId) {
      toast.error('Please select an event.');
      return;
    }

    setIsPublishing(true);
    try {
      const res = await fetch('/api/winners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          winners: [
            { userId: 'usr_superadmin_001', rank: 'FIRST', points: 100 },
            { userId: 'usr_admin_002', rank: 'SECOND', points: 75 },
          ],
        }),
      });

      if (res.ok) {
        toast.success('Winner Cascade Executed! Points credited, achievements unlocked, and notifications broadcasted.');
      } else {
        toast.error('Failed to execute winner cascade.');
      }
    } catch {
      toast.error('Network error executing winner cascade.');
    } finally {
      setIsPublishing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#00A4EF]" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Trophy className="w-7 h-7 text-[#FFB900]" /> Winner Management &amp; Cascade Engine
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
              value={selectedEventId || (events[0]?.id ?? '')}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full p-2.5 text-xs bg-white dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A4EF] focus:outline-none"
            >
              {events.map((evt) => (
                <option key={evt.id} value={evt.id}>
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
                value={firstPlace}
                onChange={(e) => setFirstPlace(e.target.value)}
                className="w-full p-2 text-xs bg-white dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] rounded-lg text-slate-900 dark:text-white"
              />
            </div>

            <div className="p-4 rounded-2xl bg-slate-500/10 border border-slate-500/30 space-y-2">
              <span className="text-xs font-bold text-slate-400">🥈 2nd Place Runner Up (+75 pts)</span>
              <input
                type="text"
                value={secondPlace}
                onChange={(e) => setSecondPlace(e.target.value)}
                className="w-full p-2 text-xs bg-white dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] rounded-lg text-slate-900 dark:text-white"
              />
            </div>

            <div className="p-4 rounded-2xl bg-amber-700/10 border border-amber-700/30 space-y-2">
              <span className="text-xs font-bold text-amber-600">🥉 3rd Place (+50 pts)</span>
              <input
                type="text"
                value={thirdPlace}
                onChange={(e) => setThirdPlace(e.target.value)}
                className="w-full p-2 text-xs bg-white dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] rounded-lg text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <Button type="submit" variant="fluent" disabled={isPublishing} className="w-full font-bold justify-center">
            <Send className="w-4 h-4" /> {isPublishing ? 'Executing Cascade Engine...' : 'Publish Winners & Credit Points'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
