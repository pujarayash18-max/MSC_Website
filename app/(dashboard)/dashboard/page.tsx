'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { INITIAL_EVENTS, INITIAL_NOTICES } from '@/lib/services/dataService';
import {
  Calendar,
  Award,
  Zap,
  QrCode,
  Trophy,
  FolderDown,
  ChevronRight,
  Pin
} from 'lucide-react';

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const upcomingEvent = INITIAL_EVENTS[0];

  return (
    <div className="space-y-8">
      {/* 15.1 MICROSOFT 365 STYLE HEADER */}
      <div className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#151B23] border border-slate-200 dark:border-[#2A323D] relative overflow-hidden shadow-xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4 text-center md:text-left">
            <Image
              src={user?.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={user?.fullName || 'User Profile'}
              width={64}
              height={64}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-[#00A4EF] shadow-md"
            />
            <div>
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-[#F5F7FA]">
                  Good morning, {user?.fullName || 'Student'}
                </h1>
                <Badge variant="primary">{user?.roleName || 'Student Member'}</Badge>
              </div>
              <p className="text-xs text-slate-600 dark:text-[#A8B0BB] mt-1">
                Here&apos;s what&apos;s happening in MCC today • Enrollment: {user?.enrollmentNumber || '92100103045'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/dashboard/registrations">
              <Button variant="fluent" size="sm">
                <QrCode className="w-4 h-4" /> My Event Passes
              </Button>
            </Link>
          </div>
        </div>

        {/* 15.2 MICROSOFT 365 STAT CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-200 dark:border-[#2A323D]">
          <Card className="p-4 bg-slate-50 dark:bg-[#0B0F14] border-slate-200 dark:border-[#2A323D] flex items-center justify-between">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-[#A8B0BB]">POINTS</p>
              <p className="text-2xl font-black text-[#FFB900] mt-0.5">{user?.communityPoints || 340}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-[#FFB900]/10 border border-[#FFB900]/30 text-[#FFB900]">
              <Trophy className="w-5 h-5" />
            </div>
          </Card>

          <Card className="p-4 bg-slate-50 dark:bg-[#0B0F14] border-slate-200 dark:border-[#2A323D] flex items-center justify-between">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-[#A8B0BB]">EVENTS</p>
              <p className="text-2xl font-black text-[#00A4EF] mt-0.5">12</p>
            </div>
            <div className="p-2.5 rounded-xl bg-[#00A4EF]/10 border border-[#00A4EF]/30 text-[#00A4EF]">
              <Calendar className="w-5 h-5" />
            </div>
          </Card>

          <Card className="p-4 bg-slate-50 dark:bg-[#0B0F14] border-slate-200 dark:border-[#2A323D] flex items-center justify-between">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-[#A8B0BB]">CERTIFICATES</p>
              <p className="text-2xl font-black text-[#7FBA00] mt-0.5">8</p>
            </div>
            <div className="p-2.5 rounded-xl bg-[#7FBA00]/10 border border-[#7FBA00]/30 text-[#7FBA00]">
              <Award className="w-5 h-5" />
            </div>
          </Card>

          <Card className="p-4 bg-slate-50 dark:bg-[#0B0F14] border-slate-200 dark:border-[#2A323D] flex items-center justify-between">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-[#A8B0BB]">RANK</p>
              <p className="text-2xl font-black text-[#00A4EF] mt-0.5">#{user?.currentRank || 1}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-[#00A4EF]/10 border border-[#00A4EF]/30 text-[#00A4EF]">
              <Zap className="w-5 h-5" />
            </div>
          </Card>
        </div>

        {/* Compact Attendance Summary Widget */}
        <Link href="/dashboard/attendance" className="block mt-4 group">
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-sky-500/10 to-teal-500/10 border border-emerald-500/30 flex items-center justify-between transition-all group-hover:border-emerald-500/60 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  Attendance: 100% Rate <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 font-mono">(3 Verified Check-ins)</span>
                </p>
                <p className="text-[11px] text-slate-600 dark:text-[#A8B0BB]">
                  All QR entry passes verified • Eligible for all event completion certificates
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-emerald-500 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      {/* Grid Section: Events & Notices */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Registered Event */}
        <Card className="lg:col-span-2 p-6 space-y-4 border-slate-200 dark:border-[#2A323D]">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#2A323D] pb-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-[#F5F7FA] flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#00A4EF]" /> Next Registered Event
            </h3>
            <Link href="/events" className="text-xs text-[#0078D4] dark:text-[#00A4EF] hover:underline flex items-center font-semibold">
              View All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D]">
            <Image src={upcomingEvent.banner} alt={upcomingEvent.title} width={144} height={96} className="w-full sm:w-36 h-24 rounded-xl object-cover" />
            <div className="space-y-1 text-center sm:text-left flex-1">
              <Badge variant="primary" size="sm">{upcomingEvent.category}</Badge>
              <h4 className="text-sm font-bold text-slate-900 dark:text-[#F5F7FA]">{upcomingEvent.title}</h4>
              <p className="text-xs text-slate-600 dark:text-[#A8B0BB]">Aug 25, 2026 • {upcomingEvent.venue}</p>
            </div>
            <Link href={`/dashboard/registrations/reg_az_8801`}>
              <Button variant="fluent" size="sm">
                QR Pass
              </Button>
            </Link>
          </div>
        </Card>

        {/* Notices */}
        <Card className="p-6 space-y-4 border-slate-200 dark:border-[#2A323D]">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#2A323D] pb-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-[#F5F7FA] flex items-center gap-2">
              <Pin className="w-4 h-4 text-[#00A4EF]" /> Active Notices
            </h3>
          </div>

          <div className="space-y-3">
            {INITIAL_NOTICES.slice(0, 2).map((n) => (
              <div key={n.id} className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] space-y-1">
                <Badge variant={n.priority === 'Urgent' ? 'danger' : 'purple'} size="sm">{n.priority}</Badge>
                <h5 className="text-xs font-bold text-slate-900 dark:text-[#F5F7FA]">{n.title}</h5>
                <p className="text-[11px] text-slate-600 dark:text-[#A8B0BB] line-clamp-2">{n.description}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Action Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Link href="/dashboard/resources">
          <Card className="p-6 text-center space-y-2 hover:border-[#00A4EF]/50 transition-all cursor-pointer border-slate-200 dark:border-[#2A323D]">
            <FolderDown className="w-8 h-8 text-[#00A4EF] mx-auto" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-[#F5F7FA]">Event Resources</h4>
            <p className="text-xs text-slate-600 dark:text-[#A8B0BB]">Download slides & starter code</p>
          </Card>
        </Link>

        <Link href="/dashboard/certificates">
          <Card className="p-6 text-center space-y-2 hover:border-[#7FBA00]/50 transition-all cursor-pointer border-slate-200 dark:border-[#2A323D]">
            <Award className="w-8 h-8 text-[#7FBA00] mx-auto" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-[#F5F7FA]">My Certificates</h4>
            <p className="text-xs text-slate-600 dark:text-[#A8B0BB]">Download verified PDF certificates</p>
          </Card>
        </Link>

        <Link href="/dashboard/leaderboard">
          <Card className="p-6 text-center space-y-2 hover:border-[#FFB900]/50 transition-all cursor-pointer border-slate-200 dark:border-[#2A323D]">
            <Trophy className="w-8 h-8 text-[#FFB900] mx-auto" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-[#F5F7FA]">Leaderboard</h4>
            <p className="text-xs text-slate-600 dark:text-[#A8B0BB]">Check overall & monthly ranks</p>
          </Card>
        </Link>
      </div>
    </div>
  );
}
