'use client';

import Link from 'next/link';
import { useTheme } from '@/lib/theme-provider';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users,
  Calendar,
  Award,
  QrCode,
  ArrowUpRight,
  Plus,
  BarChart3,
  Send,
  ShieldCheck,
  FileSpreadsheet,
  Loader2,
  RefreshCw,
  Clock,
  UserCheck,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useQuery } from '@tanstack/react-query';

async function fetchOverviewStats() {
  const res = await fetch('/api/admin/overview', {
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
    },
  });
  if (!res.ok) return null;
  const json = await res.json();
  return json.data || null;
}

export default function AdminDashboardOverviewPage() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const axisColor = isDark ? '#A8B0BB' : '#64748B';
  const tooltipBg = isDark ? '#151B23' : '#FFFFFF';
  const tooltipBorder = isDark ? '#2A323D' : '#CBD5E1';
  const tooltipColor = isDark ? '#F5F7FA' : '#0F172A';

  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['admin-overview-telemetry'],
    queryFn: fetchOverviewStats,
    refetchInterval: 15000,
  });

  const metrics = data?.metrics || {
    activeStudents: 0,
    eventsPublished: 0,
    certificatesIssued: 0,
    attendanceRate: '0%',
  };

  const monthlyTelemetry = data?.monthlyTelemetry || [
    { month: 'Jan', registrations: 0, attendance: 0 },
    { month: 'Feb', registrations: 0, attendance: 0 },
    { month: 'Mar', registrations: 0, attendance: 0 },
    { month: 'Apr', registrations: 0, attendance: 0 },
    { month: 'May', registrations: 0, attendance: 0 },
    { month: 'Jun', registrations: 0, attendance: 0 },
  ];

  const categoryDistribution = data?.categoryDistribution || [
    { name: 'Workshops', value: 50, color: '#00A4EF' },
    { name: 'Hackathons', value: 30, color: '#7FBA00' },
    { name: 'Bootcamps', value: 20, color: '#FFB900' },
  ];

  const recentRegistrations = data?.recentActivity?.registrations || [];

  const communityMetricsCards = [
    {
      label: 'Active Students',
      value: metrics.activeStudents.toLocaleString(),
      change: 'Live Database',
      color: 'text-[#00A4EF]',
      bg: 'bg-[#00A4EF]/10 border-[#00A4EF]/30',
      icon: Users,
    },
    {
      label: 'Events Published',
      value: metrics.eventsPublished.toString(),
      change: 'Live Database',
      color: 'text-[#7FBA00]',
      bg: 'bg-[#7FBA00]/10 border-[#7FBA00]/30',
      icon: Calendar,
    },
    {
      label: 'Certificates Issued',
      value: metrics.certificatesIssued.toString(),
      change: 'Live Database',
      color: 'text-[#7FBA00]',
      bg: 'bg-[#7FBA00]/10 border-[#7FBA00]/30',
      icon: Award,
    },
    {
      label: 'Attendance Rate',
      value: metrics.attendanceRate,
      change: 'Calculated Live',
      color: 'text-[#00A4EF]',
      bg: 'bg-[#00A4EF]/10 border-[#00A4EF]/30',
      icon: QrCode,
    },
  ];

  return (
    <div className="space-y-8">
      {/* 17.1 MANAGEMENT PORTAL HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-[#2A323D] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-[#F5F7FA]">
              MCC Administration Portal
            </h1>
            <Badge variant="primary">Microsoft 365 Live Telemetry</Badge>
          </div>
          <p className="text-xs text-slate-600 dark:text-[#A8B0BB] mt-1">
            Real-time database analytics, live student registrations, and automated event metrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="text-xs gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin' : ''}`} /> Refresh Stats
          </Button>

          <Link href="/admin/events/new">
            <Button variant="fluent" size="sm">
              <Plus className="w-4 h-4" /> Create Event
            </Button>
          </Link>
          <Link href="/admin/forms">
            <Button variant="secondary" size="sm">
              <FileSpreadsheet className="w-4 h-4" /> Form Builder
            </Button>
          </Link>
        </div>
      </div>

      {/* 17.2 KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {communityMetricsCards.map((m) => {
          const Icon = m.icon;
          return (
            <Card key={m.label} className="p-5 border-slate-200 dark:border-[#2A323D] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-[#A8B0BB]">
                  {m.label}
                </span>
                <div className={`p-2 rounded-xl border ${m.bg} ${m.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <h3 className="text-3xl font-black text-slate-900 dark:text-[#F5F7FA]">
                  {isLoading ? <Loader2 className="w-6 h-6 animate-spin text-[#00A4EF]" /> : m.value}
                </h3>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
                  {m.change} <ArrowUpRight className="w-3 h-3 ml-0.5" />
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* 17.3 CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Trend Chart */}
        <Card className="lg:col-span-2 p-6 space-y-4 border-slate-200 dark:border-[#2A323D]">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#2A323D] pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-[#F5F7FA] flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#00A4EF]" /> Registration &amp; Attendance Telemetry
            </h3>
            <Badge variant="outline">Live Database Analytics</Badge>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTelemetry}>
                <XAxis dataKey="month" stroke={axisColor} fontSize={11} tickLine={false} />
                <YAxis stroke={axisColor} fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    borderColor: tooltipBorder,
                    borderRadius: '0.75rem',
                    color: tooltipColor,
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="registrations" fill="#00A4EF" radius={[4, 4, 0, 0]} name="Registrations" />
                <Bar dataKey="attendance" fill="#7FBA00" radius={[4, 4, 0, 0]} name="Attendance" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Category Breakdown */}
        <Card className="p-6 space-y-4 border-slate-200 dark:border-[#2A323D]">
          <h3 className="text-sm font-bold text-slate-900 dark:text-[#F5F7FA] border-b border-slate-200 dark:border-[#2A323D] pb-3">
            Event Category Distribution
          </h3>

          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryDistribution.map((entry: { color: string }, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    borderColor: tooltipBorder,
                    borderRadius: '0.75rem',
                    color: tooltipColor,
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 text-xs">
            {categoryDistribution.map((cat: { name: string; value: number; color: string }) => (
              <div key={cat.name} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-700 dark:text-[#A8B0BB]">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                  {cat.name}
                </span>
                <span className="font-bold text-slate-900 dark:text-white">{cat.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* 17.4 LIVE RECENT REGISTRATIONS FEED */}
      {recentRegistrations.length > 0 && (
        <Card className="p-6 space-y-4 border-slate-200 dark:border-[#2A323D] bg-white dark:bg-[#151B23]">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#2A323D] pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-[#F5F7FA] flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#7FBA00]" /> Recent Student Registrations Activity
            </h3>
            <Link href="/admin/registrations" className="text-xs text-[#00A4EF] font-semibold hover:underline">
              View All Registrations &rarr;
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-[#2A323D]">
            {recentRegistrations.map((reg: any) => (
              <div key={reg.id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-sky-500/10 text-sky-500">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-extrabold text-slate-900 dark:text-white">{reg.fullName}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      Registered for: <span className="font-semibold text-[#00A4EF]">{reg.eventTitle || reg.event?.title || 'MCC Event'}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {reg.submittedAt || reg.createdAt ? new Date(reg.submittedAt || reg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Quick Action Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Link href="/admin/attendance/scanner">
          <Card className="p-4 text-center space-y-2 hover:border-[#00A4EF]/50 transition-all cursor-pointer border-slate-200 dark:border-[#2A323D]">
            <QrCode className="w-6 h-6 text-[#00A4EF] mx-auto" />
            <h4 className="text-xs font-bold text-slate-900 dark:text-[#F5F7FA]">Launch Scanner</h4>
          </Card>
        </Link>

        <Link href="/admin/users">
          <Card className="p-4 text-center space-y-2 hover:border-[#7FBA00]/50 transition-all cursor-pointer border-slate-200 dark:border-[#2A323D]">
            <Users className="w-6 h-6 text-[#7FBA00] mx-auto" />
            <h4 className="text-xs font-bold text-slate-900 dark:text-[#F5F7FA]">User Roles &amp; Access</h4>
          </Card>
        </Link>

        <Link href="/admin/notifications">
          <Card className="p-4 text-center space-y-2 hover:border-[#00A4EF]/50 transition-all cursor-pointer border-slate-200 dark:border-[#2A323D]">
            <Send className="w-6 h-6 text-[#00A4EF] mx-auto" />
            <h4 className="text-xs font-bold text-slate-900 dark:text-[#F5F7FA]">Push Alerts</h4>
          </Card>
        </Link>

        <Link href="/admin/rbac">
          <Card className="p-4 text-center space-y-2 hover:border-[#7FBA00]/50 transition-all cursor-pointer border-slate-200 dark:border-[#2A323D]">
            <ShieldCheck className="w-6 h-6 text-[#7FBA00] mx-auto" />
            <h4 className="text-xs font-bold text-slate-900 dark:text-[#F5F7FA]">RBAC Matrix</h4>
          </Card>
        </Link>
      </div>
    </div>
  );
}
