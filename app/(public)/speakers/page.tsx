/* eslint-disable @next/next/no-img-element */
'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Globe,
  ChevronRight,
  Loader2,
  Search,
  Mic,
  Users,
  X,
  Building2,
} from 'lucide-react';
import { LinkedinIcon } from '@/components/icons';
import { useQuery } from '@tanstack/react-query';
import type { Speaker } from '@/types';

async function fetchSpeakers(): Promise<Speaker[]> {
  const res = await fetch('/api/speakers');
  if (!res.ok) return [];
  const json = await res.json();
  return json.data?.speakers || [];
}

export default function SpeakersPage() {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('All');

  const { data: speakers = [], isLoading } = useQuery({
    queryKey: ['speakers'],
    queryFn: fetchSpeakers,
  });

  // Collect all unique expertise tags across speakers
  const allExpertise = useMemo(() => {
    const set = new Set<string>();
    speakers.forEach((s) => (s.expertise || []).forEach((e) => set.add(e)));
    return ['All', ...Array.from(set).sort()];
  }, [speakers]);

  const filtered = useMemo(() => {
    return speakers.filter((s) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.organization.toLowerCase().includes(q) ||
        s.designation.toLowerCase().includes(q) ||
        (s.bio || '').toLowerCase().includes(q) ||
        (s.expertise || []).some((e) => e.toLowerCase().includes(q));
      const matchesFilter =
        activeFilter === 'All' || (s.expertise || []).includes(activeFilter);
      return matchesSearch && matchesFilter;
    });
  }, [speakers, search, activeFilter]);

  const orgCount = useMemo(
    () => new Set(speakers.map((s) => s.organization)).size,
    [speakers]
  );

  return (
    <div className="min-h-screen">
      {/* ── Hero Banner ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0078D4] via-[#005A9E] to-[#003578] py-20 px-4">
        {/* Decorative blobs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full bg-[#00A4EF]/20 blur-3xl pointer-events-none" />
        <Mic className="absolute right-12 top-8 w-36 h-36 text-white/5 pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center space-y-5">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur border border-white/20 text-white text-xs font-semibold tracking-wide uppercase">
            <Mic className="w-3.5 h-3.5 text-[#00A4EF]" />
            Guest Experts &amp; Mentors
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight">
            Speakers Who Shaped&nbsp;
            <span className="text-[#00A4EF]">MSC</span>
          </h1>
          <p className="text-base text-blue-100 max-w-xl mx-auto leading-relaxed">
            Industry leaders, Microsoft MVPs, cloud architects, and software
            veterans who delivered masterclasses and workshops at the Microsoft
            Student Community.
          </p>

          {/* Quick stats */}
          <div className="flex flex-wrap justify-center gap-6 pt-2">
            {[
              { icon: Users, label: 'Experts Featured', value: speakers.length },
              { icon: Mic, label: 'Sessions Delivered', value: '25+' },
              { icon: Building2, label: 'Organizations', value: orgCount || '—' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-2 text-white/80 text-sm">
                <Icon className="w-4 h-4 text-[#00A4EF]" />
                <span className="font-bold text-white">{isLoading ? '…' : value}</span>
                <span className="text-blue-200">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Search + Filter Bar ── */}
      <div className="sticky top-[60px] z-20 bg-white/80 dark:bg-[#0B0F14]/90 backdrop-blur-xl border-b border-slate-200 dark:border-[#2A323D] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-0 w-full sm:w-auto sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search speakers, org, expertise…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs bg-slate-100 dark:bg-[#151B23] border border-slate-200 dark:border-[#2A323D] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0078D4] text-slate-900 dark:text-white"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Expertise filter pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto flex-1 pb-0.5 min-w-0">
            {allExpertise.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveFilter(tag)}
                className={`shrink-0 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all whitespace-nowrap ${
                  activeFilter === tag
                    ? 'bg-[#0078D4] text-white border-[#0078D4] shadow-md shadow-blue-500/20'
                    : 'bg-slate-100 dark:bg-[#151B23] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-[#2A323D] hover:border-[#0078D4] hover:text-[#0078D4] dark:hover:text-[#00A4EF]'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Results count */}
          {!isLoading && (
            <span className="shrink-0 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
              {filtered.length} speaker{filtered.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* ── Speaker Grid ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-28 gap-4">
            <Loader2 className="w-9 h-9 animate-spin text-[#0078D4]" />
            <p className="text-sm text-slate-500">Loading speakers…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-[#151B23] flex items-center justify-center">
              <Mic className="w-7 h-7 text-slate-400" />
            </div>
            <p className="text-slate-700 dark:text-slate-300 font-semibold">No speakers found</p>
            <p className="text-xs text-slate-500 dark:text-slate-500 max-w-xs">
              {search || activeFilter !== 'All'
                ? 'Try adjusting your search or filter.'
                : 'No speakers have been added yet. Check back soon!'}
            </p>
            {(search || activeFilter !== 'All') && (
              <button
                onClick={() => { setSearch(''); setActiveFilter('All'); }}
                className="text-xs text-[#0078D4] dark:text-[#00A4EF] underline underline-offset-2"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map((spk) => (
              <SpeakerCard key={spk.id} speaker={spk} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SpeakerCard({ speaker: spk }: { speaker: Speaker }) {
  return (
    <Card className="group relative overflow-hidden flex flex-col border-slate-200 dark:border-[#2A323D] bg-white dark:bg-[#151B23] hover:border-[#0078D4]/50 dark:hover:border-[#00A4EF]/40 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300">
      {/* Top accent line on hover */}
      <div className="h-0.5 w-full bg-gradient-to-r from-[#0078D4] via-[#00A4EF] to-[#7FBA00] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="p-6 flex flex-col gap-4 flex-1">
        {/* Header: photo + name */}
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            <img
              src={
                spk.photo ||
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face'
              }
              alt={spk.name}
              className="w-[72px] h-[72px] rounded-2xl object-cover border-2 border-slate-200 dark:border-[#2A323D] group-hover:border-[#00A4EF]/60 transition-colors shadow-md"
            />
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#7FBA00] border-2 border-white dark:border-[#151B23]" />
          </div>

          <div className="min-w-0 flex-1 space-y-0.5">
            <h3 className="font-bold text-slate-900 dark:text-white text-base leading-tight truncate">
              {spk.name}
            </h3>
            <p className="text-xs font-semibold text-[#0078D4] dark:text-[#00A4EF] truncate">
              {spk.designation}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 truncate">
              <Building2 className="w-3 h-3 shrink-0" />
              {spk.organization}
            </p>
          </div>
        </div>

        {/* Bio */}
        {spk.bio && (
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
            {spk.bio}
          </p>
        )}

        {/* Expertise tags */}
        {spk.expertise && spk.expertise.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {spk.expertise.slice(0, 4).map((exp) => (
              <span
                key={exp}
                className="px-2 py-0.5 text-[10px] font-semibold rounded-lg bg-blue-50 dark:bg-[#0078D4]/10 text-[#0078D4] dark:text-[#00A4EF] border border-blue-100 dark:border-[#0078D4]/20"
              >
                {exp}
              </span>
            ))}
            {spk.expertise.length > 4 && (
              <span className="px-2 py-0.5 text-[10px] font-semibold rounded-lg bg-slate-100 dark:bg-[#1B222C] text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-[#2A323D]">
                +{spk.expertise.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Footer: socials + CTA */}
        <div className="mt-auto pt-4 border-t border-slate-100 dark:border-[#2A323D] flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            {spk.linkedin && (
              <a
                href={
                  spk.linkedin.startsWith('http')
                    ? spk.linkedin
                    : `https://linkedin.com/in/${spk.linkedin}`
                }
                target="_blank"
                rel="noreferrer"
                className="text-slate-400 hover:text-[#0078D4] dark:hover:text-[#00A4EF] transition-colors"
                title="LinkedIn"
              >
                <LinkedinIcon className="w-4 h-4" />
              </a>
            )}
            {spk.website && (
              <a
                href={spk.website}
                target="_blank"
                rel="noreferrer"
                className="text-slate-400 hover:text-[#0078D4] dark:hover:text-[#00A4EF] transition-colors"
                title="Website"
              >
                <Globe className="w-4 h-4" />
              </a>
            )}
          </div>

          <Link href={`/speakers/${spk.id}`}>
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-7 px-3 border-[#0078D4]/30 text-[#0078D4] dark:text-[#00A4EF] hover:bg-[#0078D4] hover:text-white dark:hover:bg-[#00A4EF] dark:hover:text-[#0B0F14] hover:border-[#0078D4] transition-all"
            >
              View Profile <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
