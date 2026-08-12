/* eslint-disable @next/next/no-img-element */
'use client';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Mail, Loader2 } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from '@/components/icons';
import { useQuery } from '@tanstack/react-query';
import type { TeamMember } from '@/types';

const CATEGORIES = [
  'All Members',
  'Faculty Coordinators',
  'President',
  'Vice President',
  'Technical Team',
  'Events Team',
  'Media Team',
  'Content Team',
  'Volunteers'
];

async function fetchTeam(): Promise<TeamMember[]> {
  const res = await fetch('/api/team');
  if (!res.ok) return [];
  const json = await res.json();
  return json.data?.members || [];
}

export default function TeamPage() {
  const [selectedCategory, setSelectedCategory] = useState('All Members');
  const [search, setSearch] = useState('');

  const { data: teamMembers = [], isLoading } = useQuery({
    queryKey: ['team'],
    queryFn: fetchTeam,
  });

  const filteredTeam = teamMembers.filter((m) => {
    const matchesCategory = selectedCategory === 'All Members' || m.category === selectedCategory;
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.position.toLowerCase().includes(search.toLowerCase()) ||
      m.department.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 py-8">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <Badge variant="primary">Community Leaders</Badge>
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">MCC Core Team</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">Meet the faculty leads, student presidents, and team heads driving the Microsoft Campus Club.</p>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                selectedCategory === cat
                  ? 'bg-sky-600 text-white font-semibold shadow-md shadow-sky-600/25'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search team members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#00A4EF]" />
        </div>
      ) : filteredTeam.length === 0 ? (
        <div className="text-center py-16 text-slate-500">No team members found matching your search.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTeam.map((m) => (
            <Card key={m.id} className="p-5 flex flex-col items-center text-center space-y-3 hover:border-sky-500/50 transition-all group">
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-sky-500/30 group-hover:border-sky-500 transition-colors">
                <img src={m.photo || '/avatar-placeholder.png'} alt={m.name} className="w-full h-full object-cover" />
              </div>

              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">{m.name}</h3>
                <p className="text-xs font-semibold text-sky-600 dark:text-sky-400 mt-0.5">{m.position}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{m.department}</p>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{m.bio}</p>

              {/* Skills */}
              {m.skills && m.skills.length > 0 && (
                <div className="flex flex-wrap justify-center gap-1">
                  {m.skills.slice(0, 3).map((s) => (
                    <span key={s} className="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 rounded-md text-slate-600 dark:text-slate-300">
                      {s}
                    </span>
                  ))}
                </div>
              )}

              {/* Social Links */}
              <div className="flex items-center gap-3 pt-2 text-slate-400 hover:text-slate-600">
                {m.github && (
                  <a href={`https://github.com/${m.github}`} target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 dark:hover:text-white">
                    <GithubIcon className="w-4 h-4" />
                  </a>
                )}
                {m.linkedin && (
                  <a href={`https://linkedin.com/in/${m.linkedin}`} target="_blank" rel="noopener noreferrer" className="hover:text-sky-500">
                    <LinkedinIcon className="w-4 h-4" />
                  </a>
                )}
                {m.email && (
                  <a href={`mailto:${m.email}`} className="hover:text-emerald-500">
                    <Mail className="w-4 h-4" />
                  </a>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
