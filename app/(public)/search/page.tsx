'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { INITIAL_EVENTS, INITIAL_SPEAKERS, INITIAL_TEAM, INITIAL_NOTICES } from '@/lib/services/dataService';
import { Search } from 'lucide-react';

export default function GlobalSearchPage() {
  const [query, setQuery] = useState('');

  const matchingEvents = query ? INITIAL_EVENTS.filter((e) => e.title.toLowerCase().includes(query.toLowerCase()) || e.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()))) : [];
  const matchingSpeakers = query ? INITIAL_SPEAKERS.filter((s) => s.name.toLowerCase().includes(query.toLowerCase()) || s.expertise.some((e) => e.toLowerCase().includes(query.toLowerCase()))) : [];
  const matchingTeam = query ? INITIAL_TEAM.filter((t) => t.name.toLowerCase().includes(query.toLowerCase()) || t.position.toLowerCase().includes(query.toLowerCase())) : [];
  const matchingNotices = query ? INITIAL_NOTICES.filter((n) => n.title.toLowerCase().includes(query.toLowerCase())) : [];

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

      {query && (
        <div className="space-y-6">
          <p className="text-xs font-semibold text-slate-600 dark:text-[#A8B0BB]">Found {totalResults} matching results for "{query}"</p>

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
                  <Link href={`/events/${evt.slug}`}>
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
                    <p className="text-xs text-slate-600 dark:text-[#A8B0BB]">{spk.designation} - {spk.organization}</p>
                  </div>
                  <Link href={`/speakers/${spk.speakerId}`}>
                    <Button variant="outline" size="sm">Profile</Button>
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
