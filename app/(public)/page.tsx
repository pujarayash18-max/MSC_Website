/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { formatDateDeterministic } from '@/lib/date';
import {
  Sparkles,
  Calendar,
  Users,
  Award,
  Mic,
  ArrowRight,
  Clock,
  MapPin,
  ChevronRight,
  Pin,
  Code,
  Trophy,
  Compass,
  BookOpen,
  Hammer,
  Quote,
  Globe,
  HeartHandshake,
  TrendingUp,
  Rocket,
  ShieldCheck,
  HelpCircle,
  ChevronDown,
  UserCheck,
  GraduationCap,
  Share2,
} from 'lucide-react';
import type { Event, Notice } from '@/types';
import { CommunitySocialModal } from '@/components/community/CommunitySocialModal';

const VISION_ITEMS = [
  {
    title: 'A Starting Point for Every Student',
    description: 'Every student should have a place to begin, regardless of their current knowledge or experience.',
    icon: Compass,
    color: 'text-sky-500 bg-sky-500/10 border-sky-500/30'
  },
  {
    title: 'A Bridge to the Real World',
    description: 'Students should be able to connect what they learn in classrooms with practical applications and industry expectations.',
    icon: Globe,
    color: 'text-purple-500 bg-purple-500/10 border-purple-500/30'
  },
  {
    title: 'A Community Where Everyone Learns Together',
    description: 'MSC should be a student-led community where no one is expected to know everything. Students learn, explore, experiment and figure things out together.',
    icon: Users,
    color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30'
  },
  {
    title: 'A Community That Develops Student Leaders',
    description: 'Students should not only participate but also take ownership, lead, create and contribute to the community.',
    icon: Award,
    color: 'text-amber-500 bg-amber-500/10 border-amber-500/30'
  },
  {
    title: 'A Support System Throughout the Journey',
    description: 'Students should always have people, resources and opportunities to turn to when they are stuck or looking for their next step.',
    icon: HeartHandshake,
    color: 'text-rose-500 bg-rose-500/10 border-rose-500/30'
  },
  {
    title: 'A Cycle of Growth and Contribution',
    description: 'Students who grow through the community should become the ones who guide, support and create opportunities for the students who come after them.',
    icon: TrendingUp,
    color: 'text-blue-500 bg-blue-500/10 border-blue-500/30'
  }
];

const MISSION_ITEMS = [
  {
    condition: "When a student doesn't know where to start",
    action: 'Provide direction, resources and opportunities to help them take their first step.',
    icon: Sparkles,
    badgeColor: 'bg-sky-500/10 text-sky-400 border-sky-500/30'
  },
  {
    condition: 'When a student wants to learn',
    action: 'Create opportunities through workshops, expert sessions, hands-on activities and peer-to-peer learning around Microsoft and emerging technologies.',
    icon: BookOpen,
    badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
  },
  {
    condition: 'When a student wants to explore',
    action: 'Encourage students to explore technologies, ideas, projects, people, industry exposure and career possibilities together.',
    icon: Rocket,
    badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30'
  },
  {
    condition: 'When a student wants to build',
    action: 'Encourage students to apply what they learn by creating projects, solutions and practical experiences.',
    icon: Hammer,
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30'
  },
  {
    condition: 'When a student wants to take responsibility',
    action: 'Give students opportunities to take ownership, lead teams, organize initiatives, manage projects and make decisions.',
    icon: ShieldCheck,
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
  },
  {
    condition: 'When a student gets stuck',
    action: 'Help them find their next step through peers, experienced students, resources, guidance and opportunities.',
    icon: HelpCircle,
    badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/30'
  },
  {
    condition: 'When a student grows',
    action: 'Encourage them to share what they have learned, showcase their work, support their peers and contribute back to the community.',
    icon: Share2,
    badgeColor: 'bg-teal-500/10 text-teal-400 border-teal-500/30'
  }
];

const JOURNEY_STEPS = [
  {
    step: '01',
    title: 'Join',
    subtitle: 'Enter the Community',
    description: 'Connect with motivated students across departments who want to learn, build, and explore modern technology together.',
    icon: Users,
    color: 'from-sky-500/20 to-blue-500/20 text-sky-400 border-sky-500/30',
  },
  {
    step: '02',
    title: 'Learn',
    subtitle: 'Practical Workshops',
    description: 'Attend hands-on workshops across Microsoft Azure, AI, Web Development, Cloud Computing, and modern developer tools.',
    icon: BookOpen,
    color: 'from-purple-500/20 to-indigo-500/20 text-purple-400 border-purple-500/30',
  },
  {
    step: '03',
    title: 'Build',
    subtitle: 'Real-World Projects',
    description: 'Develop production-ready projects, hackathon solutions, and open-source campus tools with peer mentors.',
    icon: Hammer,
    color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30',
  },
];

const FAQS = [
  {
    q: 'What is the Microsoft Campus Club?',
    a: 'The Microsoft Campus Club (MCC) is a student-led technology community at Marwadi University, supported by Microsoft Student Ambassadors. We help students learn, build projects, and connect with industry mentors.',
  },
  {
    q: 'Who is eligible to join the community?',
    a: 'Students from any department, academic year, or skill level are eligible to join. All you need is curiosity and a desire to learn alongside fellow student developers.',
  },
  {
    q: 'Are there any registration or membership fees?',
    a: 'No. Joining the club and attending regular workshops, webinars, and community learning sessions is completely free unless a specialized external event specifies otherwise.',
  },
  {
    q: 'How do I register for upcoming technical events?',
    a: 'Browse the Events section, select an upcoming workshop or competition, review the agenda, and click the Register Now button while registrations are open.',
  },
  {
    q: 'What is a Microsoft Student Ambassador?',
    a: 'Microsoft Student Ambassadors are globally recognized student leaders who guide peers in exploring Microsoft technologies, Azure cloud learning paths, student developer benefits, and career opportunities.',
  },
  {
    q: 'Do I need prior programming experience to participate?',
    a: 'No! Beginners are completely welcome. Most of our sessions begin with core fundamentals and guide you step by step toward building practical applications.',
  },
];

async function fetchHomeData() {
  const [eventsRes, noticesRes] = await Promise.all([
    fetch('/api/events'),
    fetch('/api/notices'),
  ]);

  const [eventsData, noticesData] = await Promise.all([
    eventsRes.ok ? eventsRes.json() : { data: {} },
    noticesRes.ok ? noticesRes.json() : { data: {} },
  ]);

  return {
    events: (eventsData.data?.events || []) as Event[],
    notices: (noticesData.data?.notices || []) as Notice[],
  };
}

export default function HomePage() {
  const { data } = useQuery({
    queryKey: ['home-data'],
    queryFn: fetchHomeData,
  });

  const events = data?.events || [];
  const notices = data?.notices || [];

  const nextEvent = events[0] || {
    id: 'evt_default',
    title: 'Azure Cloud Masterclass',
    shortDescription: 'Deep dive into Azure Serverless architecture and Cloud Computing.',
    venue: 'Seminar Hall 4, Main Campus',
    startDate: '2026-08-25T10:00:00.000Z',
    remainingSeats: 25,
    capacity: 150,
    slug: 'azure-cloud-masterclass',
  };

  const [countdown, setCountdown] = useState({ days: 12, hours: 8, minutes: 42, seconds: 19 });
  const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const { data: statsData } = useQuery({
    queryKey: ['public-stats'],
    queryFn: async () => {
      const res = await fetch('/api/stats');
      if (!res.ok) return null;
      const json = await res.json();
      return json.data?.stats || json.stats || null;
    },
  });

  const displayStats = [
    { label: 'Active Student Members', value: statsData ? statsData.members : 8, icon: Users, suffix: '+' },
    { label: 'Technical Events Hosted', value: statsData ? statsData.events : 3, icon: Calendar, suffix: '+' },
    { label: 'Industry Speakers Hosted', value: statsData ? statsData.speakers : 2, icon: Mic, suffix: '+' },
    { label: 'Certificates Issued', value: statsData ? statsData.certificates : 0, icon: Award, suffix: '+' },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        return { ...prev, seconds: 59, minutes: Math.max(0, prev.minutes - 1) };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-24 scroll-smooth">
      {/* 1. HERO SECTION */}
      <section id="home" className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6 max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-600 dark:text-sky-400 text-xs font-semibold shadow-lg shadow-sky-500/10 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-sky-500 dark:text-sky-400" /> Microsoft Campus Club • Marwadi University
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Learn Faster. Build Together. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 dark:from-sky-400 dark:via-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Lead with Tech.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            A student-led community for workshops, practical projects, peer learning, and Microsoft technology exposure at Marwadi University.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 max-w-lg mx-auto pt-1">
            {['Cloud Labs', 'AI & ML Workshops', 'Live Demos', 'Peer Mentorship'].map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-medium text-slate-600 dark:text-slate-400"
              >
                ✓ {tag}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link href="/events">
              <Button variant="fluent" size="lg" className="shadow-xl shadow-sky-500/25">
                Explore Events <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <Button variant="secondary" size="lg" onClick={() => setIsSocialModalOpen(true)}>
              <Users className="w-4 h-4 mr-1.5 text-sky-400" /> Join Community
            </Button>
          </div>
        </motion.div>

        {/* Floating Glass Capability Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16 text-left max-w-5xl mx-auto">
          <Card className="p-6 fluent-glass-card hover:border-sky-500/50 transition-all duration-300 group">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Code className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Event Management</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              Seamless event registration, instant digital attendance passes, and automated capacity tracking for technical sessions.
            </p>
          </Card>

          <Card className="p-6 fluent-glass-card hover:border-purple-500/50 transition-all duration-300 group">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Trophy className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Community Recognition</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              Earn community points through workshop attendance, hackathon wins, and technical contributions to rank on campus leaderboards.
            </p>
          </Card>

          <Card className="p-6 fluent-glass-card hover:border-emerald-500/50 transition-all duration-300 group">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Verified Credentials</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              Receive official digital certificates of completion and achievement equipped with instant QR code verification lookup.
            </p>
          </Card>
        </div>
      </section>

      {/* 2. COMMUNITY STATISTICS */}
      <section className="bg-slate-100/80 dark:bg-slate-900/60 border-y border-slate-200 dark:border-slate-800/80 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {displayStats.map((s) => {
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

      {/* 3. VISION & MISSION */}
      <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Vision */}
        <div className="space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <Badge variant="primary">Our Vision</Badge>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Our Vision
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {VISION_ITEMS.map((item, idx) => {
              const IconComponent = item.icon;
              return (
                <Card
                  key={idx}
                  className="p-6 space-y-4 border-slate-200 dark:border-slate-800 hover:border-sky-500/40 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${item.color}`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {item.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Mission */}
        <div className="space-y-8 pt-6 border-t border-slate-800/80">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <Badge variant="purple">Our Mission</Badge>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Our Mission
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
            {MISSION_ITEMS.map((item, idx) => {
              const IconComponent = item.icon;
              return (
                <Card key={idx} className="p-5 bg-slate-900/60 border-slate-800 flex items-start gap-4 hover:border-sky-500/30 transition-colors">
                  <div className={`p-2.5 rounded-xl border shrink-0 ${item.badgeColor}`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-sky-400 block">{item.condition}</span>
                    <p className="text-xs text-slate-300 leading-relaxed">{item.action}</p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. YOUR COMMUNITY JOURNEY */}
      <section id="journey" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <Badge variant="primary">How It Works</Badge>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Your Community Journey
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            From curiosity to building real-world software and leading technical initiatives.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {JOURNEY_STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <Card
                key={step.step}
                className="p-8 bg-slate-900/60 border-slate-800 rounded-3xl relative overflow-hidden space-y-5 hover:border-sky-500/40 transition-all duration-300 group shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-2xl bg-gradient-to-br ${step.color} border flex items-center justify-center`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-4xl font-black text-slate-800 dark:text-slate-800/80 group-hover:text-sky-500/30 transition-colors">
                    {step.step}
                  </span>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-sky-400 block">
                    {step.subtitle}
                  </span>
                  <h3 className="text-2xl font-bold text-white">{step.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{step.description}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* 5. UPCOMING EVENT & COUNTDOWN */}
      <section id="events" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-sky-600 dark:text-sky-400" /> {formatDateDeterministic(nextEvent.startDate)}</span>
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

              <Link href={`/events/${nextEvent.slug || nextEvent.id}`} className="block">
                <Button variant="fluent" className="w-full">
                  Register Now <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FACULTY MENTORSHIP & PRESIDENT LEADERSHIP SECTION */}
      <section id="leadership" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <Badge variant="primary">Community Leadership</Badge>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Faculty Mentorship &amp; Chapter Leadership
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Guided by distinguished faculty members and student leaders at Marwadi University.
          </p>
        </div>

        {/* CARD 1: Faculty Coordinator — Prof. Pranav Tank Sir */}
        <Card className="p-8 md:p-10 bg-slate-900/90 border-slate-800 rounded-3xl relative overflow-hidden shadow-2xl space-y-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative shrink-0">
              <div className="w-32 h-32 md:w-36 md:h-36 rounded-3xl bg-slate-800 border-2 border-sky-500 shadow-xl shadow-sky-500/20 flex flex-col items-center justify-center text-sky-400 p-4 text-center">
                <GraduationCap className="w-12 h-12 mb-1" />
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-300">Prof. Pranav Tank</span>
              </div>
              <div className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-sky-500 text-white shadow-lg">
                <Award className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-4 text-center md:text-left flex-1">
              <div className="space-y-1">
                <Badge variant="primary" className="mb-1">Faculty Coordinator &amp; Patron</Badge>
                <h3 className="text-2xl font-extrabold text-white">Prof. Pranav Tank Sir</h3>
                <p className="text-xs font-semibold text-sky-400">
                  Assistant Professor, Department of Computer Engineering • Marwadi University
                </p>
              </div>

              <blockquote className="text-xs sm:text-sm text-slate-300 italic leading-relaxed bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                &quot;The Microsoft Campus Club serves as a beacon for practical technological learning at Marwadi University. We extend our sincere gratitude to Prof. Pranav Tank Sir for his constant mentorship, vision, and unwavering support in nurturing our student developers.&quot;
              </blockquote>
            </div>
          </div>
        </Card>

        {/* CARD 2: President & Founder — Tisha Simejiya */}
        <Card className="p-8 md:p-10 bg-slate-900/90 border-slate-800 rounded-3xl relative overflow-hidden shadow-2xl space-y-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative shrink-0">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400"
                alt="Tisha Simejiya"
                className="w-32 h-32 md:w-36 md:h-36 rounded-3xl object-cover border-2 border-purple-500 shadow-xl shadow-purple-500/20"
              />
              <div className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-purple-500 text-white shadow-lg">
                <Quote className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-4 text-center md:text-left flex-1">
              <div className="space-y-1">
                <Badge variant="purple" className="mb-1">President &amp; Founder's Message</Badge>
                <h3 className="text-2xl font-extrabold text-white">Tisha Simejiya</h3>
                <p className="text-xs font-semibold text-purple-400">
                  Associate Microsoft Student Ambassador • Founder &amp; President
                </p>
              </div>

              <blockquote className="text-xs sm:text-sm text-slate-300 italic leading-relaxed bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                &quot;This community is for every student who wants to learn, build, ask questions, and be part of something meaningful. You do not need to know everything before you begin. Join us, bring your curiosity, and be part of the change we can create together at Marwadi University.&quot;
              </blockquote>
            </div>
          </div>
        </Card>
      </section>

      {/* 7. NOTICE BOARD & FREQUENTLY ASKED QUESTIONS */}
      <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Notice Board */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Pin className="w-5 h-5 text-sky-600 dark:text-sky-400" /> Notice Board
            </h3>
            <Badge variant="primary">Live Announcements</Badge>
          </div>

          <div className="space-y-3">
            {notices.length > 0 ? (
              notices.slice(0, 3).map((notice) => (
                <Card key={notice.id} className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant={notice.priority === 'Urgent' ? 'danger' : 'purple'}>
                      {notice.priority} Notice
                    </Badge>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      {formatDateDeterministic(String(notice.publishDate))}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">{notice.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{notice.description}</p>
                </Card>
              ))
            ) : (
              <Card className="p-6 text-center text-slate-600 dark:text-slate-400 text-xs">
                No active announcements at this time. Check back soon for official club updates.
              </Card>
            )}
          </div>
        </div>

        {/* FAQs */}
        <div className="space-y-6 pt-4">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <Badge variant="primary">FAQ</Badge>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center justify-center gap-2">
              <HelpCircle className="w-7 h-7 text-sky-400" /> Frequently Asked Questions
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Everything you need to know about joining and contributing to Microsoft Campus Club.
            </p>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <Card
                  key={idx}
                  className="bg-slate-900/80 border-slate-800 rounded-2xl overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-white hover:text-sky-400 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-sky-400 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="p-5 pt-0 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* 8. ADVANCE YOUR TECHNICAL JOURNEY CTA (AT THE VERY END) */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="rounded-3xl bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 p-8 md:p-12 text-white text-center shadow-2xl space-y-5 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.1)_0%,_transparent_60%)]" />
          <div className="relative z-10 space-y-5">
            <Badge variant="outline" className="text-white border-white/40">Open to All Marwadi University Students</Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold">Advance Your Technical Journey</h2>
            <p className="text-xs sm:text-sm text-sky-100 max-w-xl mx-auto leading-relaxed">
              Join the student developer community at Marwadi University. Access Microsoft certification guidance, technical workshops, hackathons, and student ambassador mentorship opportunities.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto pt-2">
              <Link href="/join-us" className="flex-1">
                <Button variant="secondary" size="lg" className="w-full font-bold text-xs shadow-lg">
                  <UserCheck className="w-4 h-4 mr-1.5" /> Join Chapter
                </Button>
              </Link>
              <Link href="/events" className="flex-1">
                <Button variant="outline" size="lg" className="w-full font-bold text-xs border-white/30 text-white hover:bg-white/10">
                  <Calendar className="w-4 h-4 mr-1.5" /> Browse Events
                </Button>
              </Link>
            </div>

            <p className="text-[11px] text-sky-200/70 pt-1">
              Microsoft Learn Student Ambassadors • Azure for Students Benefits • GitHub Student Developer Pack
            </p>
          </div>
        </div>
      </section>

      <CommunitySocialModal isOpen={isSocialModalOpen} onClose={() => setIsSocialModalOpen(false)} />
    </div>
  );
}
