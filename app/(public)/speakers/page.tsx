'use client';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { INITIAL_SPEAKERS } from '@/lib/services/dataService';
import { Mic, Globe, ChevronRight } from 'lucide-react';
import { LinkedinIcon } from '@/components/icons';

export default function SpeakersPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 py-8">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <Badge variant="primary">Guest Experts (§23)</Badge>
        <h1 className="text-4xl font-extrabold text-white">Invited Speakers & Mentors</h1>
        <p className="text-sm text-slate-400">Industry leaders, Microsoft MVPs, and software architects delivering masterclasses for MCC.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {INITIAL_SPEAKERS.map((spk) => (
          <Card key={spk.id} className="p-6 space-y-4 hover:border-sky-500/50 transition-all duration-300">
            <div className="flex items-start gap-4">
              <img
                src={spk.photo}
                alt={spk.name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-sky-400 shrink-0"
              />
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white">{spk.name}</h3>
                <p className="text-xs font-semibold text-sky-400">{spk.designation}</p>
                <p className="text-xs text-slate-400">{spk.organization}</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{spk.bio}</p>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {spk.expertise.map((exp) => (
                <Badge key={exp} variant="purple" size="sm">
                  {exp}
                </Badge>
              ))}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
              <div className="flex items-center gap-3">
                {spk.linkedin && (
                  <a href={`https://linkedin.com/in/${spk.linkedin}`} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-sky-400 flex items-center gap-1">
                    <LinkedinIcon className="w-4 h-4" /> LinkedIn
                  </a>
                )}
                {spk.website && (
                  <a href={spk.website} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-sky-400 flex items-center gap-1">
                    <Globe className="w-4 h-4" /> Portfolio
                  </a>
                )}
              </div>

              <Link href={`/speakers/${spk.speakerId}`} className="text-sky-400 hover:underline flex items-center gap-1 font-semibold">
                View Sessions <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
