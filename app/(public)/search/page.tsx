'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import type { Event, Speaker, TeamMember, Notice } from '@/types';

async function fetchSearchData() {
  const [eventsRes, speakersRes, teamRes, noticesRes] = await Promise.all([
    fetch('/api/events'),
    fetch('/api/speakers'),
    fetch('/api/team'),
    fetch('/api/notices'),
  ]);

  const [eventsData, speakersData, teamData, noticesData] = await Promise.all([
    eventsRes.ok ? eventsRes.json() : { data: {} },
    speakersRes.ok ? speakersRes.json() : { data: {} },
    teamRes.ok ? teamRes.json() : { data: {} },
    noticesRes.ok ? noticesRes.json() : { data: {} },
  ]);

  return {
    events: (eventsData.data?.events || []) as Event[],
    speakers: (speakersData.data?.speakers || []) as Speaker[],
    team: (teamData.data?.members || []) as TeamMember[],
    notices: (noticesData.data?.notices || []) as Notice[],
  };
}

export default function GlobalSearchPage() {
  const [query, setQuery] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['global-search-data'],
    queryFn: fetchSearchData,
  });

  const events = data?.events || [];
  const speakers = data?.speakers || [];
  const team = data?.team || [];
  const notices = data?.notices || [];

  const q = query.trim().toLowerCase();

  const matchingEvents = q ? events.filter((e) => e.title?.toLowerCase().includes(q) || e.tags?.some((t) => t.toLowerCase().includes(q))) : [];
  const matchingSpeakers = q ? speakers.filter((s) => s.name?.toLowerCase().includes(q) || s.expertise?.some((e) => e.toLowerCase().includes(q))) : [];
  const matchingTeam = q ? team.filter((t) => t.name?.toLowerCase().includes(q) || t.position?.toLowerCase().includes(q)) : [];
  const matchingNotices = q ? notices.filter((n) => n.title?.toLowerCase().includes(q) || n.description?.toLowerCase().includes(q)) : [];

  const totalResults = matchingEvents.length + matchingSpeakers.length + matchingTeam.length + matchingNotices.length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 py-8">
      <div className="text-center space-y-3">
        <Badge variant="primary">Platform Search</Badge>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Global Instant Search</h1>
        <p className="text-sm text-slate-600 dark:text-[#A8B0BB]">Search across events, guest speakers, core team members, and community notices.</p>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#00A4EF]" />
        <input
          type="text"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type to search events, Azure, speakers, team..."
          className="w-full pl-12 pr-4 py-4 text-sm bg-white dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#00A4EF] focus:outline-none shadow-xl"
        />
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#00A4EF]" />
        </div>
      )}

      {!isLoading && query && (
        <div className="space-y-6">
          <p className="text-xs font-semibold text-slate-600 dark:text-[#A8B0BB]">Found {totalResults} matching results for &quot;{query}&quot;</p>

          {/* Events Results */}
          {matchingEvents.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#00A4EF]">Events ({matchingEvents.length})</h3>
              {matchingEvents.map((evt) => (
                <Card key={evt.id} className="p-4 flex items-center justify-between gap-4 border-slate-200 dark:border-[#2A323D]">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{evt.title}</h4>
                    <p className="text-xs text-slate-600 dark:text-[#A8B0BB]">{evt.category} • {evt.venue}</p>
                  </div>
                  <Link href={`/events/${evt.slug || evt.id}`}>
                    <Button variant="fluent" size="sm">View</Button>
                  </Link>
                </Card>
              ))}
            </div>
          )}

          {/* Speakers Results */}
          {matchingSpeakers.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#7FBA00]">Speakers ({matchingSpeakers.length})</h3>
              {matchingSpeakers.map((spk) => (
                <Card key={spk.id} className="p-4 flex items-center justify-between gap-4 border-slate-200 dark:border-[#2A323D]">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{spk.name}</h4>
                    <p className="text-xs text-slate-600 dark:text-[#A8B0BB]">{spk.designation} at {spk.organization}</p>
                  </div>
                  <Link href={`/speakers/${spk.id}`}>
                    <Button variant="outline" size="sm">Profile</Button>
                  </Link>
                </Card>
              ))}
            </div>
          )}

          {/* Team Results */}
          {matchingTeam.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400">Team ({matchingTeam.length})</h3>
              {matchingTeam.map((tm) => (
                <Card key={tm.id} className="p-4 flex items-center justify-between gap-4 border-slate-200 dark:border-[#2A323D]">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{tm.name}</h4>
                    <p className="text-xs text-slate-600 dark:text-[#A8B0BB]">{tm.position} • {tm.department}</p>
                  </div>
                  <Link href="/team">
                    <Button variant="ghost" size="sm">Team Page</Button>
                  </Link>
                </Card>
              ))}
            </div>
          )}

          {/* Notices Results */}
          {matchingNotices.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">Notices ({matchingNotices.length})</h3>
              {matchingNotices.map((n) => (
                <Card key={n.id} className="p-4 flex items-center justify-between gap-4 border-slate-200 dark:border-[#2A323D]">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{n.title}</h4>
                    <p className="text-xs text-slate-600 dark:text-[#A8B0BB] line-clamp-1">{n.description}</p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
