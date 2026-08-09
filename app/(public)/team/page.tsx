/* eslint-disable @next/next/no-img-element */
'use client';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { INITIAL_TEAM } from '@/lib/services/dataService';
import { Search, Mail } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from '@/components/icons';

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

export default function TeamPage() {
  const [selectedCategory, setSelectedCategory] = useState('All Members');
  const [search, setSearch] = useState('');

  const filteredTeam = INITIAL_TEAM.filter((m) => {
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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search member or role..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:outline-none shadow-sm"
          />
        </div>
      </div>

      {/* Team Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
        {filteredTeam.map((member) => (
          <Card key={member.id} className="p-6 space-y-4 text-center hover:border-sky-500/50 transition-all duration-300">
            <img
              src={member.photo}
              alt={member.name}
              className="w-24 h-24 rounded-2xl object-cover mx-auto border-2 border-sky-500 shadow-xl"
            />
            <div>
              <Badge variant="primary" size="sm" className="mb-2">{member.category}</Badge>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{member.name}</h3>
              <p className="text-xs font-semibold text-sky-600 dark:text-sky-400">{member.position}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{member.department}</p>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">{member.bio}</p>

            <div className="flex items-center justify-center gap-3 pt-2 text-slate-400 border-t border-slate-200 dark:border-slate-800">
              {member.github && (
                <a href={`https://github.com/${member.github}`} target="_blank" rel="noreferrer" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  <GithubIcon className="w-4 h-4" />
                </a>
              )}
              {member.linkedin && (
                <a href={`https://linkedin.com/in/${member.linkedin}`} target="_blank" rel="noreferrer" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                  <LinkedinIcon className="w-4 h-4" />
                </a>
              )}
              {member.email && (
                <a href={`mailto:${member.email}`} className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                  <Mail className="w-4 h-4" />
                </a>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
