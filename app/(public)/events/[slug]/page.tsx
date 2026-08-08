import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { INITIAL_EVENTS, INITIAL_SPEAKERS } from '@/lib/services/dataService';
import { EventRegistrationModal } from '@/components/events/EventRegistrationModal';
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  CheckCircle,
  ArrowLeft,
  Mic,
  Award,
} from 'lucide-react';

export function generateStaticParams() {
  return INITIAL_EVENTS.map((event) => ({
    slug: event.slug,
  }));
}

interface EventPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EventDetailPage({ params }: EventPageProps) {
  const { slug } = await params;
  const event = INITIAL_EVENTS.find((e) => e.slug === slug) || INITIAL_EVENTS[0];

  if (!event) {
    notFound();
  }

  const speakers = INITIAL_SPEAKERS.filter((s) => event.speakerIds.includes(s.speakerId));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 py-8">
      {/* Back link */}
      <Link href="/events">
        <Button variant="outline" size="sm">
          <ArrowLeft className="w-4 h-4" /> Back to All Events
        </Button>
      </Link>

      {/* Hero Banner Header */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
        <div className="h-72 sm:h-96 relative">
          <img src={event.banner} alt={event.title} className="w-full h-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
        </div>

        <div className="p-8 sm:p-10 -mt-32 relative z-10 space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="primary" className="font-bold">{event.category}</Badge>
            <Badge variant="purple">{event.mode}</Badge>
            <Badge variant={event.registrationStatus === 'Open' ? 'success' : 'danger'}>
              {event.registrationStatus === 'Open' ? 'Registration Open' : 'Registration Closed'}
            </Badge>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">{event.title}</h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">{event.shortDescription}</p>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800/80">
            <div className="flex flex-wrap items-center gap-6 text-xs text-slate-300">
              <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-sky-400" /> Aug 25, 2026</span>
              <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-sky-400" /> 09:30 AM - 04:30 PM</span>
              <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-sky-400" /> {event.venue}</span>
              <span className="flex items-center gap-2"><Users className="w-4 h-4 text-emerald-400" /> Seats Left: {event.remainingSeats} / {event.capacity}</span>
            </div>

            <div className="flex items-center gap-3">
              <EventRegistrationModal event={event} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Full Description & Agenda */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="p-8 space-y-4">
            <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-3">About The Event</h2>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{event.description}</p>
          </Card>

          {/* Agenda Builder Display */}
          {event.agenda && event.agenda.length > 0 && (
            <Card className="p-8 space-y-6">
              <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
                <Clock className="w-5 h-5 text-sky-400" /> Event Agenda Timeline
              </h2>

              <div className="space-y-4">
                {event.agenda.map((ag) => (
                  <div key={ag.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-4">
                    <div>
                      <span className="text-xs font-extrabold text-sky-400">{ag.time}</span>
                      <h3 className="text-sm font-bold text-white mt-0.5">{ag.title}</h3>
                      {ag.speaker && <p className="text-xs text-slate-400 mt-1">Speaker: {ag.speaker} • {ag.room}</p>}
                    </div>
                    <Badge variant="purple" size="sm">{ag.sessionType}</Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Right Column: Speakers & Details */}
        <div className="space-y-6">
          {/* Speakers */}
          <Card className="p-6 space-y-4">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
              <Mic className="w-4 h-4 text-sky-400" /> Keynote Speakers
            </h3>
            <div className="space-y-4">
              {speakers.map((spk) => (
                <div key={spk.id} className="flex items-center gap-3">
                  <img src={spk.photo} alt={spk.name} className="w-12 h-12 rounded-xl object-cover border border-sky-400" />
                  <div>
                    <h4 className="text-xs font-bold text-white">{spk.name}</h4>
                    <p className="text-[11px] text-sky-400">{spk.designation}</p>
                    <p className="text-[10px] text-slate-500">{spk.organization}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Perks & Rewards */}
          <Card className="p-6 space-y-3 bg-gradient-to-b from-slate-900 to-sky-950/30">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" /> Event Rewards
            </h3>
            <ul className="text-xs text-slate-300 space-y-2">
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" /> Earn <strong>+20 Community Points</strong></li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" /> Verified Certificate of Participation</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" /> Live Resource & Code Downloads</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
