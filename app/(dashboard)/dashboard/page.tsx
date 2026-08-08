'use client';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { INITIAL_EVENTS, INITIAL_NOTICES } from '@/lib/services/dataService';
import {
  LayoutDashboard,
  Calendar,
  Award,
  Zap,
  QrCode,
  Trophy,
  FolderDown,
  ChevronRight,
  Pin,
  MessageSquare,
  Bell
} from 'lucide-react';

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const upcomingEvent = INITIAL_EVENTS[0];

  return (
    <div className="space-y-8">
      {/* 39 PROFILE & QUICK STATS HEADER */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-sky-900/80 via-blue-950/60 to-slate-950 border border-sky-500/30 relative overflow-hidden shadow-2xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4 text-center md:text-left">
            <img
              src={user?.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={user?.fullName}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-sky-400 shadow-lg"
            />
            <div>
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <h1 className="text-xl font-extrabold text-white">Welcome back, {user?.fullName}!</h1>
                <Badge variant="primary" size="sm">{user?.roleName}</Badge>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {user?.department} • {user?.year} • Enrollment: {user?.enrollmentNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/dashboard/registrations">
              <Button variant="fluent" size="sm">
                My QR Passes <QrCode className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Stat Pill Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/80 text-center">
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Community Points</p>
            <p className="text-xl font-extrabold text-amber-400">{user?.communityPoints} pts</p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Overall Rank</p>
            <p className="text-xl font-extrabold text-sky-400">#{user?.currentRank}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Attendance Rate</p>
            <p className="text-xl font-extrabold text-emerald-400">{user?.attendancePercentage}%</p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Certificates Earned</p>
            <p className="text-xl font-extrabold text-purple-400">4 PDFs</p>
          </div>
        </div>
      </div>

      {/* Grid Section: Events & Notices */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Registered Event */}
        <Card className="lg:col-span-2 p-6 space-y-4 border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-sky-400" /> Next Registered Event
            </h3>
            <Link href="/dashboard/events" className="text-xs text-sky-400 hover:underline flex items-center">
              View All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <img src={upcomingEvent.banner} alt={upcomingEvent.title} className="w-full sm:w-32 h-24 rounded-xl object-cover" />
            <div className="space-y-1 text-center sm:text-left flex-1">
              <Badge variant="primary" size="sm">{upcomingEvent.category}</Badge>
              <h4 className="text-sm font-bold text-white">{upcomingEvent.title}</h4>
              <p className="text-xs text-slate-400">Aug 25, 2026 • {upcomingEvent.venue}</p>
            </div>
            <Link href={`/dashboard/registrations/reg_az_8801`}>
              <Button variant="fluent" size="sm">
                QR Pass
              </Button>
            </Link>
          </div>
        </Card>

        {/* Notices */}
        <Card className="p-6 space-y-4 border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Pin className="w-4 h-4 text-sky-400" /> Active Notices
            </h3>
          </div>

          <div className="space-y-3">
            {INITIAL_NOTICES.map((n) => (
              <div key={n.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <Badge variant="danger" size="sm">{n.priority}</Badge>
                <h5 className="text-xs font-bold text-white">{n.title}</h5>
                <p className="text-[11px] text-slate-400 line-clamp-2">{n.description}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Action Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Link href="/dashboard/resources">
          <Card className="p-6 text-center space-y-2 hover:border-sky-500/50 transition-all cursor-pointer">
            <FolderDown className="w-8 h-8 text-sky-400 mx-auto" />
            <h4 className="text-sm font-bold text-white">Event Resources</h4>
            <p className="text-xs text-slate-400">Download slides & starter code</p>
          </Card>
        </Link>

        <Link href="/dashboard/certificates">
          <Card className="p-6 text-center space-y-2 hover:border-sky-500/50 transition-all cursor-pointer">
            <Award className="w-8 h-8 text-purple-400 mx-auto" />
            <h4 className="text-sm font-bold text-white">My Certificates</h4>
            <p className="text-xs text-slate-400">Download verified PDF certificates</p>
          </Card>
        </Link>

        <Link href="/dashboard/leaderboard">
          <Card className="p-6 text-center space-y-2 hover:border-sky-500/50 transition-all cursor-pointer">
            <Trophy className="w-8 h-8 text-amber-400 mx-auto" />
            <h4 className="text-sm font-bold text-white">Leaderboard</h4>
            <p className="text-xs text-slate-400">Check overall & monthly ranks</p>
          </Card>
        </Link>
      </div>
    </div>
  );
}
