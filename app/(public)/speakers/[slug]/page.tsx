'use client';

import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { INITIAL_SPEAKERS } from '@/lib/services/dataService';
import Link from 'next/link';
import { ArrowLeft, Mic } from 'lucide-react';

export default function SpeakerDetailPage() {
  const params = useParams();
  const speakerId = params?.slug as string;
  const speaker = INITIAL_SPEAKERS.find((s) => s.speakerId === speakerId) || INITIAL_SPEAKERS[0];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 py-8">
      <Link href="/speakers">
        <Button variant="outline" size="sm">
          <ArrowLeft className="w-4 h-4" /> Back to Speakers
        </Button>
      </Link>

      <Card className="p-8 space-y-6 border-slate-200 dark:border-[#2A323D]">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          <img
            src={speaker.photo}
            alt={speaker.name}
            className="w-28 h-28 rounded-2xl object-cover border-2 border-[#00A4EF] shadow-xl"
          />
          <div className="space-y-2 flex-1">
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">{speaker.name}</h1>
            <p className="text-sm font-semibold text-[#0078D4] dark:text-[#00A4EF]">{speaker.designation} at {speaker.organization}</p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              {speaker.expertise.map((exp) => (
                <Badge key={exp} variant="purple">
                  {exp}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-3 border-t border-slate-200 dark:border-[#2A323D] pt-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Biography</h3>
          <p className="text-sm text-slate-600 dark:text-[#A8B0BB] leading-relaxed">{speaker.bio}</p>
        </div>

        <div className="space-y-3 border-t border-slate-200 dark:border-[#2A323D] pt-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Mic className="w-4 h-4 text-[#00A4EF]" /> Keynote Sessions Delivered at MCC
          </h3>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] space-y-1">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Azure Cloud Architecture & Serverless Masterclass</h4>
            <p className="text-xs text-slate-600 dark:text-[#A8B0BB]">Delivered on Aug 25, 2026 • Marwadi University Campus</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
