/* eslint-disable @next/next/no-img-element */
import { notFound } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Mic } from 'lucide-react';
import type { Speaker } from '@/types';

interface SpeakerPageProps {
  params: Promise<{ slug: string }>;
}

async function getSpeaker(id: string): Promise<Speaker | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/speakers/${encodeURIComponent(id)}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data?.speaker || null;
  } catch {
    return null;
  }
}

export default async function SpeakerDetailPage({ params }: SpeakerPageProps) {
  const { slug } = await params;
  const speaker = await getSpeaker(slug);

  if (!speaker) {
    notFound();
  }

  const events = (speaker as unknown as { events?: Array<{ event: { id: string; title: string; startDate: string; banner: string } }> }).events || [];

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
            <p className="text-sm font-semibold text-[#0078D4] dark:text-[#00A4EF]">
              {speaker.designation} at {speaker.organization}
            </p>

            {speaker.expertise && speaker.expertise.length > 0 && (
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                {speaker.expertise.map((exp) => (
                  <Badge key={exp} variant="purple">
                    {exp}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-[#2A323D]">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Biography</h2>
          <p className="text-sm text-slate-600 dark:text-[#A8B0BB] leading-relaxed">{speaker.bio}</p>
        </div>

        {/* Sessions Section */}
        {events.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-[#2A323D]">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Mic className="w-5 h-5 text-[#00A4EF]" /> Sessions Delivered at MCC
            </h2>

            <div className="grid grid-cols-1 gap-3">
              {events.map(({ event: evt }) => (
                <Link key={evt.id} href={`/events/${evt.id}`}>
                  <Card className="p-4 flex items-center justify-between hover:border-[#00A4EF] transition-all">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">{evt.title}</h3>
                      <p className="text-xs text-slate-500">{new Date(evt.startDate).toLocaleDateString()}</p>
                    </div>
                    <Button variant="ghost" size="sm">View Event</Button>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
