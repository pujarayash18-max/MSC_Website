/* eslint-disable @next/next/no-img-element */
'use client';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe, ChevronRight, Loader2 } from 'lucide-react';
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
  const { data: speakers = [], isLoading } = useQuery({
    queryKey: ['speakers'],
    queryFn: fetchSpeakers,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 py-8">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <Badge variant="primary">Guest Experts</Badge>
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">Invited Speakers &amp; Mentors</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">Industry leaders, Microsoft MVPs, and software architects delivering masterclasses for MCC.</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#00A4EF]" />
        </div>
      ) : speakers.length === 0 ? (
        <div className="text-center py-16 text-slate-500">No speakers found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {speakers.map((spk) => (
            <Card key={spk.id} className="p-6 space-y-4 hover:border-sky-500/50 transition-all duration-300">
              <div className="flex items-start gap-4">
                <img
                  src={spk.photo}
                  alt={spk.name}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-sky-500 shrink-0"
                />
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{spk.name}</h3>
                  <p className="text-xs font-semibold text-sky-600 dark:text-sky-400">{spk.designation}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{spk.organization}</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{spk.bio}</p>

              {spk.expertise && spk.expertise.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {spk.expertise.map((exp) => (
                    <Badge key={exp} variant="purple" size="sm">
                      {exp}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-3">
                  {spk.linkedin && (
                    <a href={`https://linkedin.com/in/${spk.linkedin}`} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400 flex items-center gap-1">
                      <LinkedinIcon className="w-4 h-4" /> LinkedIn
                    </a>
                  )}
                  {spk.website && (
                    <a href={spk.website} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400 flex items-center gap-1">
                      <Globe className="w-4 h-4" /> Portfolio
                    </a>
                  )}
                </div>

                <Link href={`/speakers/${spk.id}`} className="text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 font-semibold">
                  View Sessions <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
