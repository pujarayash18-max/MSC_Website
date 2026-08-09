'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { INITIAL_EVENTS } from '@/lib/services/dataService';
import {
  Users,
  Calendar,
  Award,
  QrCode,
  ArrowUpRight,
  Plus,
  BarChart3,
  CheckCircle2,
  Clock,
  Send,
  ShieldCheck,
  FileSpreadsheet
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
  Cell
} from 'recharts';

const COMMUNITY_METRICS = [
  { label: 'Active Students', value: '1,240', change: '+12%', color: 'text-[#00A4EF]', bg: 'bg-[#00A4EF]/10 border-[#00A4EF]/30', icon: Users },
  { label: 'Events Published', value: '28', change: '+4', color: 'text-[#7FBA00]', bg: 'bg-[#7FBA00]/10 border-[#7FBA00]/30', icon: Calendar },
  { label: 'Certificates Issued', value: '450', change: '+85', color: 'text-[#7FBA00]', bg: 'bg-[#7FBA00]/10 border-[#7FBA00]/30', icon: Award },
  { label: 'Attendance Rate', value: '94.2%', change: '+3.1%', color: 'text-[#00A4EF]', bg: 'bg-[#00A4EF]/10 border-[#00A4EF]/30', icon: QrCode }
];

const MONTHLY_REGISTRATIONS_DATA = [
  { month: 'Jan', registrations: 120, attendance: 110 },
  { month: 'Feb', registrations: 190, attendance: 180 },
  { month: 'Mar', registrations: 240, attendance: 220 },
  { month: 'Apr', registrations: 310, attendance: 290 },
  { month: 'May', registrations: 280, attendance: 260 },
  { month: 'Jun', registrations: 420, attendance: 400 }
];

const EVENT_CATEGORY_DISTRIBUTION = [
  { name: 'Hackathons', value: 40, color: '#00A4EF' },
  { name: 'Workshops', value: 35, color: '#7FBA00' },
  { name: 'Bootcamps', value: 15, color: '#FFB900' },
  { name: 'Seminars', value: 10, color: '#F25022' }
];

export default function AdminDashboardOverviewPage() {
  return (
    <div className="space-y-8">
      {/* 17.1 MANAGEMENT PORTAL HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-[#2A323D] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-[#F5F7FA]">
              MCC Administration Portal (§78)
            </h1>
            <Badge variant="primary">Microsoft 365 Admin</Badge>
          </div>
          <p className="text-xs text-slate-600 dark:text-[#A8B0BB] mt-1">
            Real-time telemetry, student registrations, winner cascade triggers, and system analytics.
          </p>
        </div>

        <div className="flex items-center gap-2">
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
        {COMMUNITY_METRICS.map((m) => {
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
                <h3 className="text-3xl font-black text-slate-900 dark:text-[#F5F7FA]">{m.value}</h3>
                <span className="text-xs font-bold text-[#7FBA00] flex items-center">
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
              <BarChart3 className="w-4 h-4 text-[#00A4EF]" /> Registration & Attendance Telemetry
            </h3>
            <Badge variant="outline">2026 Growth</Badge>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MONTHLY_REGISTRATIONS_DATA}>
                <XAxis dataKey="month" stroke="#A8B0BB" fontSize={11} tickLine={false} />
                <YAxis stroke="#A8B0BB" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#151B23',
                    borderColor: '#2A323D',
                    borderRadius: '0.75rem',
                    color: '#F5F7FA',
                    fontSize: '12px'
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
                  data={EVENT_CATEGORY_DISTRIBUTION}
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {EVENT_CATEGORY_DISTRIBUTION.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 text-xs">
            {EVENT_CATEGORY_DISTRIBUTION.map((cat) => (
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

      {/* Quick Action Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Link href="/admin/attendance/scanner">
          <Card className="p-4 text-center space-y-2 hover:border-[#00A4EF]/50 transition-all cursor-pointer border-slate-200 dark:border-[#2A323D]">
            <QrCode className="w-6 h-6 text-[#00A4EF] mx-auto" />
            <h4 className="text-xs font-bold text-slate-900 dark:text-[#F5F7FA]">Launch Scanner</h4>
          </Card>
        </Link>

        <Link href="/admin/winners">
          <Card className="p-4 text-center space-y-2 hover:border-[#FFB900]/50 transition-all cursor-pointer border-slate-200 dark:border-[#2A323D]">
            <Award className="w-6 h-6 text-[#FFB900] mx-auto" />
            <h4 className="text-xs font-bold text-slate-900 dark:text-[#F5F7FA]">Winner Cascade</h4>
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
