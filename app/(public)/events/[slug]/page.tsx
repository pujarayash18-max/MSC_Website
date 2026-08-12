import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EventRegistrationModal } from '@/components/events/EventRegistrationModal';
import { Calendar, MapPin, Clock, Users, ArrowLeft, Award, Mic } from 'lucide-react';
import type { Event, Speaker } from '@/types';
import { formatDateDeterministic, formatTimeDeterministic } from '@/lib/date';

interface EventPageProps {
  params: Promise<{ slug: string }>;
}

async function getEvent(id: string): Promise<Event | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/events/${encodeURIComponent(id)}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data?.event || null;
  } catch {
    return null;
  }
}

export default async function EventDetailPage({ params }: EventPageProps) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const event = await getEvent(decodedSlug);

  if (!event) {
    notFound();
  }

  const rawSpeakers = (event as unknown as { speakers?: Array<{ speaker: Speaker }> }).speakers || [];
  const speakers: Speaker[] = rawSpeakers.map((s) => s.speaker);
  const agenda = (event as unknown as { agendaItems?: Array<{ time: string; title: string; description?: string }> }).agendaItems || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 py-8">
      {/* Back link */}
      <Link href="/events">
        <Button variant="outline" size="sm" className="shadow-sm">
          <ArrowLeft className="w-4 h-4" /> Back to All Events
        </Button>
      </Link>

      {/* Hero Banner Header */}
      <div className="relative rounded-3xl overflow-hidden border border-sky-500/30 shadow-2xl bg-gradient-to-r from-sky-700 via-blue-800 to-indigo-900 dark:from-slate-900 dark:via-sky-950/90 dark:to-slate-900">
        <div className="h-72 sm:h-96 relative">
          <Image src={event.banner} alt={event.title} fill className="object-cover opacity-50 dark:opacity-60" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-transparent" />
        </div>

        <div className="p-8 sm:p-10 -mt-36 relative z-10 space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="primary" className="font-extrabold uppercase tracking-wider bg-sky-500 text-white border-none shadow-md">
              {event.category}
            </Badge>
            <Badge variant={event.mode === 'Offline' ? 'success' : 'purple'} className="font-semibold shadow-md">
              {event.mode} Event
            </Badge>
            <Badge variant="success" className="bg-emerald-600 text-white shadow-md">
              {event.registrationStatus || 'Registration Open'}
            </Badge>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight drop-shadow-md">
            {event.title}
          </h1>

          <p className="text-slate-200 text-sm sm:text-base max-w-3xl leading-relaxed font-medium">
            {event.shortDescription}
          </p>

          {/* Quick Info Chips */}
          <div className="flex flex-wrap gap-4 pt-2 text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-700">
              <Calendar className="w-4 h-4 text-sky-400" /> {formatDateDeterministic(event.startDate)}
            </span>
            <span className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-700">
              <Clock className="w-4 h-4 text-[#7FBA00]" /> {formatTimeDeterministic(event.startDate)}
            </span>
            <span className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-700">
              <MapPin className="w-4 h-4 text-rose-400" />{' '}
              {event.mode === 'Online' || event.mode === 'ONLINE' || (event.venue && event.venue.startsWith('http'))
                ? 'Microsoft Teams / Online Session'
                : event.venue}
            </span>
            <span className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-700">
              <Users className="w-4 h-4 text-purple-400" /> {event.remainingSeats} / {event.capacity} Seats Available
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Details & Agenda */}
        <div className="lg:col-span-2 space-y-8">
          {/* Overview Section */}
          <Card className="p-8 space-y-4 border-slate-200 dark:border-[#2A323D]">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-sky-500" /> About This Event
            </h2>
            <div className="prose dark:prose-invert text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line">
              {event.description}
            </div>
          </Card>

          {/* Agenda Timeline */}
          {agenda.length > 0 && (
            <Card className="p-8 space-y-6 border-slate-200 dark:border-[#2A323D]">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-500" /> Event Schedule &amp; Agenda
              </h2>

              <div className="space-y-4 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                {agenda.map((item, idx) => (
                  <div key={idx} className="relative pl-8 space-y-1">
                    <div className="absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-sky-500 ring-4 ring-slate-100 dark:ring-slate-900" />
                    <span className="text-xs font-bold text-sky-600 dark:text-sky-400 block">{item.time}</span>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">{item.title}</h3>
                    {item.description && <p className="text-xs text-slate-500 dark:text-slate-400">{item.description}</p>}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Featured Speakers */}
          {speakers.length > 0 && (
            <Card className="p-8 space-y-6 border-slate-200 dark:border-[#2A323D]">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Mic className="w-5 h-5 text-purple-500" /> Keynote Speakers
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {speakers.map((spk) => (
                  <div key={spk.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center gap-4">
                    <Image src={spk.photo} alt={spk.name} width={56} height={56} className="w-14 h-14 rounded-xl object-cover border border-sky-500/50 shrink-0" />
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">{spk.name}</h3>
                      <p className="text-xs text-sky-600 dark:text-sky-400 truncate">{spk.designation}</p>
                      <p className="text-[11px] text-slate-500 truncate">{spk.organization}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Right Col: Registration Card */}
        <div className="space-y-6">
          <Card className="p-6 space-y-6 sticky top-24 border-sky-500/30 bg-white dark:bg-[#151B23] shadow-xl">
            <div className="space-y-2">
              <Badge variant="primary" className="w-fit">Instant Pass Generation</Badge>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">Register Now</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Complete your details to lock in your seat and generate your digital QR entry badge.
              </p>
            </div>

            <div className="space-y-3 pt-2 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <span>Registration Fee</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">Free (MCC Sponsored)</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <span>Community Points</span>
                <span className="font-bold text-purple-600 dark:text-purple-400">+50 Points on Check-in</span>
              </div>
              <div className="flex items-center justify-between pb-2">
                <span>Certificate Eligibility</span>
                <span className="font-bold text-sky-600 dark:text-sky-400">Verified QR Attendance Required</span>
              </div>
            </div>

            {/* Registration Action Modal */}
            <EventRegistrationModal event={event} />
          </Card>
        </div>
      </div>
    </div>
  );
}
