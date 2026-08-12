'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useRealtime } from '@/hooks/useRealtime';
import { useQuery } from '@tanstack/react-query';
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
import type { Event, Notice } from '@/types';

async function fetchDashboardData() {
  const [eventsRes, noticesRes] = await Promise.all([
    fetch('/api/events'),
    fetch('/api/notices')
  ]);

  const [eventsData, noticesData] = await Promise.all([
    eventsRes.ok ? eventsRes.json() : { data: {} },
    noticesRes.ok ? noticesRes.json() : { data: {} }
  ]);

  return {
    events: (eventsData.data?.events || []) as Event[],
    notices: (noticesData.data?.notices || []) as Notice[]
  };
}

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const { data, refetch } = useQuery({
    queryKey: ['student-dashboard-data'],
    queryFn: fetchDashboardData
  });

  useRealtime({
    notice_published: () => refetch(),
    registration_created: () => refetch(),
  });

  const events = data?.events || [];
  const notices = data?.notices || [];

  const upcomingEvent = events[0] || {
    id: 'evt_default',
    title: 'Azure Cloud Masterclass',
    shortDescription: 'Deep dive into Azure Serverless architecture and Cloud Computing.',
    venue: 'Seminar Hall 4, Main Campus',
    startDate: new Date().toISOString(),
    banner: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600',
    slug: 'azure-cloud-masterclass'
  };

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-200 dark:border-[#2A323D]">
          <Card className="p-4 bg-slate-50/80 dark:bg-[#0B0F14]/80 border-slate-200 dark:border-[#2A323D] flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Community Rank</p>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">#{user?.currentRank || 1}</h3>
            </div>
            <div className="p-3 rounded-xl bg-[#00A4EF]/10 border border-[#00A4EF]/30 text-[#00A4EF]">
              <Trophy className="w-5 h-5" />
            </div>
          </Card>

          <Card className="p-4 bg-slate-50/80 dark:bg-[#0B0F14]/80 border-slate-200 dark:border-[#2A323D] flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Community Points</p>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">{user?.communityPoints || 50} pts</h3>
            </div>
            <div className="p-3 rounded-xl bg-[#7FBA00]/10 border border-[#7FBA00]/30 text-[#7FBA00]">
              <Zap className="w-5 h-5" />
            </div>
          </Card>

          <Card className="p-4 bg-slate-50/80 dark:bg-[#0B0F14]/80 border-slate-200 dark:border-[#2A323D] flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Attendance Rate</p>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">{user?.attendancePercentage || 100}%</h3>
            </div>
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <Calendar className="w-5 h-5" />
            </div>
          </Card>

          <Card className="p-4 bg-slate-50/80 dark:bg-[#0B0F14]/80 border-slate-200 dark:border-[#2A323D] flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Certificates Earned</p>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">1 Verified</h3>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Award className="w-5 h-5" />
            </div>
          </Card>
        </div>
      </div>

      {/* 15.3 DASHBOARD CORE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Next Workshop & Action Hub */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 space-y-4 border-slate-200 dark:border-[#2A323D]">
            <div className="flex items-center justify-between">
              <Badge variant="primary" className="font-bold">Next Registered Workshop</Badge>
              <Link href="/events" className="text-xs text-[#00A4EF] font-bold hover:underline flex items-center gap-1">
                All Events <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row gap-5 items-start">
              <div className="relative w-full sm:w-44 h-28 rounded-xl overflow-hidden shrink-0 bg-slate-900">
                <Image
                  src={upcomingEvent.banner || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600'}
                  alt={upcomingEvent.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="space-y-2 flex-1">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">{upcomingEvent.title}</h3>
                <p className="text-xs text-slate-600 dark:text-[#A8B0BB] line-clamp-2">{upcomingEvent.shortDescription}</p>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-[#00A4EF]" /> {new Date(upcomingEvent.startDate).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>{upcomingEvent.venue}</span>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/dashboard/attendance">
              <Card className="p-5 hover:border-[#00A4EF] transition-all space-y-2 cursor-pointer border-slate-200 dark:border-[#2A323D]">
                <div className="p-2.5 rounded-xl bg-[#00A4EF]/10 text-[#00A4EF] w-fit">
                  <QrCode className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">QR Entry Check-in</h4>
                <p className="text-xs text-slate-500">View entry pass QR code for workshop check-in.</p>
              </Card>
            </Link>

            <Link href="/dashboard/resources">
              <Card className="p-5 hover:border-[#00A4EF] transition-all space-y-2 cursor-pointer border-slate-200 dark:border-[#2A323D]">
                <div className="p-2.5 rounded-xl bg-[#7FBA00]/10 text-[#7FBA00] w-fit">
                  <FolderDown className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Event Slide Decks</h4>
                <p className="text-xs text-slate-500">Download GitHub code samples &amp; PPT slides.</p>
              </Card>
            </Link>
          </div>
        </div>

        {/* Right Col: Announcements */}
        <div className="space-y-6">
          <Card className="p-6 space-y-4 border-slate-200 dark:border-[#2A323D]">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-[#2A323D] pb-3">
              <Pin className="w-4 h-4 text-[#00A4EF]" /> Live Notices
            </h3>

            {notices.length === 0 ? (
              <p className="text-xs text-slate-500">No active notices.</p>
            ) : (
              <div className="space-y-3">
                {notices.slice(0, 3).map((notice) => (
                  <div key={notice.id} className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] space-y-1">
                    <Badge variant={notice.priority === 'Urgent' ? 'danger' : 'purple'} size="sm">
                      {notice.priority}
                    </Badge>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">{notice.title}</h4>
                    <p className="text-[11px] text-slate-500 line-clamp-2">{notice.description}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
