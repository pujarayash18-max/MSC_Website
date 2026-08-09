'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { INITIAL_EVENTS, INITIAL_TEAM, INITIAL_NOTICES, INITIAL_SPONSORS } from '@/lib/services/dataService';
import { toast } from 'sonner';
import {
  Sparkles,
  Calendar,
  Users,
  Award,
  Trophy,
  Mic,
  ArrowRight,
  Clock,
  MapPin,
  ChevronRight,
  Pin,
  Send,
  Star,
  CheckCircle,
  Code
} from 'lucide-react';

const STATS = [
  { label: 'Community Members', value: 1200, icon: Users, suffix: '+' },
  { label: 'Events Conducted', value: 35, icon: Calendar, suffix: '+' },
  { label: 'Speakers Hosted', value: 25, icon: Mic, suffix: '+' },
  { label: 'Certificates Issued', value: 2500, icon: Award, suffix: '+' }
];

const TIMELINE = [
  { year: '2023', title: 'Club Founded', description: 'Established at Marwadi University to bridge academia with Microsoft technologies.' },
  { year: '2024', title: 'First Azure Cloud Workshop', description: 'Trained 250+ students on serverless functions and Cosmos DB.' },
  { year: '2025', title: 'First National Hackathon', description: 'Hosted 500+ hacker teams across India with $5,000+ prize pool.' },
  { year: '2026', title: '1,000+ Active Members', description: 'Evolved into an enterprise digital community management ecosystem.' }
];

const TESTIMONIALS = [
  {
    name: 'Harsh Vardhan',
    college: 'Marwadi University (CE)',
    event: 'Azure Cloud Workshop',
    rating: 5,
    comment: 'The hands-on Cosmos DB session was phenomenal. I got certified and earned 100 community points!'
  },
  {
    name: 'Kavya Sharma',
    college: 'MU School of IT',
    event: 'National Hackathon',
    rating: 5,
    comment: 'Instant real-time resource distribution during the hackathon made team collaboration effortless.'
  }
];

function formatDateDeterministic(dateString: string): string {
  const date = new Date(dateString);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
}

export default function HomePage() {
  const [nextEvent, setNextEvent] = useState(INITIAL_EVENTS[0]);
  const [countdown, setCountdown] = useState({ days: 12, hours: 8, minutes: 42, seconds: 19 });
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterName, setNewsletterName] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        return { ...prev, seconds: 59, minutes: Math.max(0, prev.minutes - 1) };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setIsSubscribing(true);
    setTimeout(() => {
      setIsSubscribing(false);
      toast.success(`Thank you ${newsletterName || 'friend'}! You have subscribed to MCC newsletter.`);
      setNewsletterEmail('');
      setNewsletterName('');
    }, 600);
  };

  return (
    <div className="space-y-24">
      {/* 13.1 HERO SECTION */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6 max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-600 dark:text-sky-400 text-xs font-semibold shadow-lg shadow-sky-500/10 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-sky-500 dark:text-sky-400" /> Official Club Ecosystem • Marwadi University
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Innovate, Learn & Build with <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 dark:from-sky-400 dark:via-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Microsoft Campus Club
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Empowering Marwadi University students through hands-on workshops, national hackathons, Azure cloud certification paths, achievements, and real-time community engagement.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link href="/events">
              <Button variant="fluent" size="lg" className="shadow-xl shadow-sky-500/25">
                Explore Events <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <Link href="/join-us">
              <Button variant="secondary" size="lg">
                Join Community
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Floating Acrylic Glass Preview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16 text-left max-w-5xl mx-auto">
          <Card className="p-6 fluent-glass-card hover:border-sky-500/50 transition-all duration-300 group">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Code className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Dynamic Registrations</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              Zero-hardcoded dynamic form builder, waitlist auto-promotion, and instant QR pass generation.
            </p>
          </Card>

          <Card className="p-6 fluent-glass-card hover:border-sky-500/50 transition-all duration-300 group">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Trophy className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Points & Leaderboard</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              Automatic points ledger, achievement badges, and live student leaderboards recalculated in real-time.
            </p>
          </Card>

          <Card className="p-6 fluent-glass-card hover:border-sky-500/50 transition-all duration-300 group">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Verified Certificates</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              Batch generated PDF certificates with QR code verification lookup URLs.
            </p>
          </Card>
        </div>
      </section>

      {/* 13.2 COMMUNITY STATISTICS */}
      <section className="bg-slate-100/80 dark:bg-slate-900/60 border-y border-slate-200 dark:border-slate-800/80 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {STATS.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="space-y-2">
                  <Icon className="w-6 h-6 text-sky-600 dark:text-sky-400 mx-auto opacity-90" />
                  <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {s.value}
                    {s.suffix}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">{s.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 13.3 & 13.4 UPCOMING EVENT BANNER & COUNTDOWN */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-slate-100 via-sky-50 to-slate-100 dark:from-slate-900 dark:via-sky-950/60 dark:to-slate-900 border border-sky-500/30 p-8 md:p-10 relative overflow-hidden shadow-2xl">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
            <div className="space-y-4 text-center lg:text-left max-w-2xl">
              <Badge variant="primary" className="font-bold uppercase tracking-wider">
                Next Upcoming Event
              </Badge>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {nextEvent.title}
              </h2>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{nextEvent.shortDescription}</p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-slate-600 dark:text-slate-300 pt-2">
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-sky-600 dark:text-sky-400" /> Aug 25, 2026 • 09:30 AM</span>
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-sky-600 dark:text-sky-400" /> {nextEvent.venue}</span>
              </div>
            </div>

            {/* Countdown Box */}
            <div className="p-6 rounded-2xl bg-white/90 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 text-center space-y-4 min-w-[280px] shadow-lg">
              <p className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">Registration Closes In</p>
              <div className="flex items-center justify-center gap-3">
                <div className="bg-slate-100 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 w-14">
                  <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{countdown.days}</span>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Days</p>
                </div>
                <span className="text-xl font-bold text-slate-400 dark:text-slate-600">:</span>
                <div className="bg-slate-100 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 w-14">
                  <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{countdown.hours}</span>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Hours</p>
                </div>
                <span className="text-xl font-bold text-slate-400 dark:text-slate-600">:</span>
                <div className="bg-slate-100 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 w-14">
                  <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{countdown.minutes}</span>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Mins</p>
                </div>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-400 pt-1">
                Seats Remaining: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{nextEvent.remainingSeats}</strong> / {nextEvent.capacity}
              </div>

              <Link href={`/events/${nextEvent.slug}`} className="block">
                <Button variant="fluent" className="w-full">
                  Register Now <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 14 CORE TEAM CAROUSEL */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <Badge variant="primary" className="mb-2">Leadership</Badge>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Meet Core Team Leaders</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Faculty coordinators and student ambassadors driving Microsoft Campus Club activities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {INITIAL_TEAM.map((member) => (
            <Card key={member.id} className="p-6 text-center space-y-4 hover:border-sky-500/50 transition-all duration-300">
              <img
                src={member.photo}
                alt={member.name}
                className="w-24 h-24 rounded-2xl object-cover mx-auto border-2 border-sky-500 shadow-lg"
              />
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{member.name}</h3>
                <p className="text-xs font-semibold text-sky-600 dark:text-sky-400 mt-0.5">{member.position}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{member.department}</p>
              </div>
              {member.quote && (
                <p className="text-xs text-slate-700 dark:text-slate-300 italic bg-slate-100 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  "{member.quote}"
                </p>
              )}
            </Card>
          ))}
        </div>
      </section>

      {/* 15 COMMUNITY TIMELINE */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center">
          <Badge variant="purple" className="mb-2">Our Journey</Badge>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Community Milestones</h2>
        </div>

        <div className="space-y-6 relative before:absolute before:inset-0 before:left-4 md:before:left-1/2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
          {TIMELINE.map((item, idx) => (
            <div key={item.year} className={`relative flex items-center gap-6 ${idx % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
              <div className="w-8 h-8 rounded-full bg-sky-600 dark:bg-sky-500 text-white font-bold text-xs flex items-center justify-center z-10 shrink-0 shadow-lg shadow-sky-500/30">
                {item.year.slice(2)}
              </div>
              <Card className="flex-1 p-6 space-y-1 hover:border-sky-500/40 transition-colors">
                <span className="text-xs font-extrabold text-sky-600 dark:text-sky-400">{item.year}</span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{item.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">{item.description}</p>
              </Card>
            </div>
          ))}
        </div>
      </section>

      {/* 16 NOTICE BOARD & 17 TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Notice Board */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Pin className="w-5 h-5 text-sky-600 dark:text-sky-400" /> Notice Board
            </h3>
            <Badge variant="primary">Live Announcements</Badge>
          </div>

          <div className="space-y-3">
            {INITIAL_NOTICES.map((notice) => (
              <Card key={notice.id} className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant={notice.priority === 'Urgent' ? 'danger' : 'purple'}>
                    {notice.priority} Notice
                  </Badge>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    {formatDateDeterministic(notice.publishDate)}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">{notice.title}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">{notice.description}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500 dark:text-amber-400" /> Student Testimonials
            </h3>
            <Badge variant="warning">5-Star Community Feedback</Badge>
          </div>

          <div className="space-y-3">
            {TESTIMONIALS.map((t) => (
              <Card key={t.name} className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{t.name}</h4>
                    <p className="text-xs text-sky-600 dark:text-sky-400">{t.college} • {t.event}</p>
                  </div>
                  <div className="flex text-amber-400">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 italic">"{t.comment}"</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 18 SPONSORS & 19 NEWSLETTER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Sponsors */}
        <div className="text-center space-y-4">
          <Badge variant="default">Official Partners</Badge>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Supported By Industry Leaders</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto pt-2">
            {INITIAL_SPONSORS.map((s) => (
              <Card key={s.id} className="p-6 flex items-center gap-4 hover:border-sky-500/40 transition-colors">
                <img src={s.logo} alt={s.name} className="w-12 h-12 rounded-xl object-cover" />
                <div className="text-left">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">{s.name}</h4>
                  <Badge variant="primary" className="mt-1">{s.tier} Sponsor</Badge>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">{s.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Newsletter Box */}
        <div className="rounded-3xl bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 p-8 md:p-10 text-white text-center max-w-4xl mx-auto shadow-2xl space-y-4">
          <Badge variant="outline" className="text-white border-white/40">Weekly Digest</Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold">Stay Updated with MCC Events & Azure Releases</h2>
          <p className="text-xs sm:text-sm text-sky-100 max-w-xl mx-auto">
            Subscribe to receive official announcement notifications, workshop schedules, and hackathon registration alerts.
          </p>

          <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto pt-2">
            <input
              type="text"
              placeholder="Your Name"
              value={newsletterName}
              onChange={(e) => setNewsletterName(e.target.value)}
              className="px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-sky-200 text-xs focus:outline-none focus:ring-2 focus:ring-white flex-1"
            />
            <input
              type="email"
              required
              placeholder="student@marwadiuniversity.ac.in"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              className="px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-sky-200 text-xs focus:outline-none focus:ring-2 focus:ring-white flex-1"
            />
            <Button variant="secondary" type="submit" disabled={isSubscribing} className="whitespace-nowrap font-bold text-xs">
              <Send className="w-3.5 h-3.5" /> {isSubscribing ? 'Subscribing...' : 'Subscribe'}
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}
