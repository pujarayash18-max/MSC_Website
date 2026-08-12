'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Trophy, Send, Loader2, Award, UserCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Event } from '@/types';

interface RegisteredUser {
  id: string;
  studentId: string;
  fullName: string;
  email: string;
  department?: string;
  year?: string;
  communityPoints: number;
}

async function fetchEvents(): Promise<Event[]> {
  const res = await fetch('/api/events');
  if (!res.ok) return [];
  const json = await res.json();
  return json.data?.events || [];
}

async function fetchUsers(): Promise<RegisteredUser[]> {
  const res = await fetch('/api/users', {
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
    },
  });
  if (!res.ok) return [];
  const json = await res.json();
  return json.data?.users || [];
}

export default function AdminWinnersPage() {
  const queryClient = useQueryClient();

  const { data: events = [], isLoading: isLoadingEvents } = useQuery({
    queryKey: ['admin-events-for-winners'],
    queryFn: fetchEvents,
  });

  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ['admin-users-for-winners'],
    queryFn: fetchUsers,
  });

  const [selectedEventId, setSelectedEventId] = useState('');
  const [firstPlaceUserId, setFirstPlaceUserId] = useState('');
  const [secondPlaceUserId, setSecondPlaceUserId] = useState('');
  const [thirdPlaceUserId, setThirdPlaceUserId] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    if (events.length > 0 && !selectedEventId) {
      setSelectedEventId(events[0].id);
    }
  }, [events, selectedEventId]);

  useEffect(() => {
    if (users.length > 0) {
      // Find "Yash Pujara" or default top users
      const yash = users.find((u) => u.fullName.toLowerCase().includes('yash pujara') || u.fullName.toLowerCase().includes('yash'));
      if (yash) {
        setFirstPlaceUserId(yash.id);
      } else if (!firstPlaceUserId) {
        setFirstPlaceUserId(users[0]?.id || '');
      }

      if (!secondPlaceUserId && users.length > 1) {
        setSecondPlaceUserId(users[1]?.id || '');
      }
      if (!thirdPlaceUserId && users.length > 2) {
        setThirdPlaceUserId(users[2]?.id || '');
      }
    }
  }, [users]);

  const handlePublishWinners = async (e: React.FormEvent) => {
    e.preventDefault();
    const eventId = selectedEventId || events[0]?.id;

    if (!eventId) {
      toast.error('Please select an event.');
      return;
    }

    if (!firstPlaceUserId) {
      toast.error('Please select a 1st Place Champion user.');
      return;
    }

    const winnerEntries = [
      { userId: firstPlaceUserId, rank: 'FIRST' },
      ...(secondPlaceUserId ? [{ userId: secondPlaceUserId, rank: 'SECOND' }] : []),
      ...(thirdPlaceUserId ? [{ userId: thirdPlaceUserId, rank: 'THIRD' }] : []),
    ];

    setIsPublishing(true);
    try {
      const res = await fetch('/api/winners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          winners: winnerEntries,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        const firstStudent = users.find((u) => u.id === firstPlaceUserId);
        toast.success(
          `Winner Cascade Executed! Points credited to ${firstStudent?.fullName || 'selected student'} and leaderboard updated.`,
          { description: 'Community points credited, badges unlocked, and ranks recalculated live in database.' }
        );

        // Invalidate live queries so Leaderboard, Users, & Overview update instantly
        queryClient.invalidateQueries({ queryKey: ['admin-users-for-winners'] });
        queryClient.invalidateQueries({ queryKey: ['admin-registered-users'] });
        queryClient.invalidateQueries({ queryKey: ['live-leaderboard'] });
        queryClient.invalidateQueries({ queryKey: ['admin-leaderboard-students'] });
        queryClient.invalidateQueries({ queryKey: ['admin-overview-telemetry'] });
      } else {
        toast.error('Failed to execute winner cascade.', { description: json.error });
      }
    } catch {
      toast.error('Network error executing winner cascade.');
    } finally {
      setIsPublishing(false);
    }
  };

  if (isLoadingEvents || isLoadingUsers) {
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
          Select real registered members from database. Publishing winners automatically awards points (1st = 100, 2nd = 80, 3rd = 50), updates the leaderboard, and logs points in the ledger.
        </p>
      </div>

      <Card className="p-6 space-y-6 border-slate-200 dark:border-[#2A323D] bg-white dark:bg-[#151B23]">
        <form onSubmit={handlePublishWinners} className="space-y-6">
          <div>
            <label className="text-xs font-bold text-slate-800 dark:text-[#F5F7FA] block mb-1">
              Select Target Event *
            </label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full p-3 text-xs font-semibold bg-slate-50 dark:bg-[#0D1117] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A4EF] focus:outline-none"
            >
              {events.map((evt) => (
                <option key={evt.id} value={evt.id}>
                  {evt.title} ({evt.category})
                </option>
              ))}
            </select>
          </div>

          {/* Winner Selector Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1st Place Champion */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#FFB900] flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> 🥇 1st Place Champion (+100 pts)
                </span>
                <Badge variant="warning" className="text-[10px]">1st Rank</Badge>
              </div>

              <select
                value={firstPlaceUserId}
                onChange={(e) => setFirstPlaceUserId(e.target.value)}
                className="w-full p-2.5 text-xs font-bold bg-white dark:bg-[#0D1117] border border-amber-500/40 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none cursor-pointer"
              >
                <option value="">Select 1st Winner...</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName} ({u.studentId || u.email}) — {u.communityPoints} pts
                  </option>
                ))}
              </select>
            </div>

            {/* 2nd Place Runner Up */}
            <div className="p-4 rounded-2xl bg-slate-500/10 border border-slate-500/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                  🥈 2nd Place Runner Up (+80 pts)
                </span>
                <Badge variant="outline" className="text-[10px]">2nd Rank</Badge>
              </div>

              <select
                value={secondPlaceUserId}
                onChange={(e) => setSecondPlaceUserId(e.target.value)}
                className="w-full p-2.5 text-xs font-bold bg-white dark:bg-[#0D1117] border border-slate-300 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A4EF] focus:outline-none cursor-pointer"
              >
                <option value="">Select 2nd Winner (Optional)...</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName} ({u.studentId || u.email}) — {u.communityPoints} pts
                  </option>
                ))}
              </select>
            </div>

            {/* 3rd Place */}
            <div className="p-4 rounded-2xl bg-amber-700/10 border border-amber-700/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                  🥉 3rd Place (+50 pts)
                </span>
                <Badge variant="purple" className="text-[10px]">3rd Rank</Badge>
              </div>

              <select
                value={thirdPlaceUserId}
                onChange={(e) => setThirdPlaceUserId(e.target.value)}
                className="w-full p-2.5 text-xs font-bold bg-white dark:bg-[#0D1117] border border-amber-700/40 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-600 focus:outline-none cursor-pointer"
              >
                <option value="">Select 3rd Winner (Optional)...</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName} ({u.studentId || u.email}) — {u.communityPoints} pts
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Button
            type="submit"
            variant="fluent"
            disabled={isPublishing}
            className="w-full font-bold justify-center py-3 text-xs gap-2 shadow-lg shadow-sky-500/20"
          >
            {isPublishing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {isPublishing ? 'Executing Cascade Engine & Crediting Points...' : 'Publish Winners & Credit Points Live'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
