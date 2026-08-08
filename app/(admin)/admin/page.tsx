'use client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/ui/stat-card';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';
import { Users, Calendar, Award, FileCheck, QrCode, MessageSquare, ShieldCheck, History, ArrowUpRight } from 'lucide-react';

const REGISTRATION_TREND = [
  { month: 'May', registrations: 120, checkins: 110 },
  { month: 'Jun', registrations: 240, checkins: 210 },
  { month: 'Jul', registrations: 380, checkins: 350 },
  { month: 'Aug', registrations: 520, checkins: 485 }
];

const RECENT_ACTIVITIES = [
  { user: 'Rahul Sharma', action: 'Registered for Azure Cloud Masterclass', time: '10 mins ago', module: 'Registrations' },
  { user: 'Admin Yash', action: 'Uploaded Live Event Resource "Cosmos DB Slides.pdf"', time: '25 mins ago', module: 'Resources' },
  { user: 'System Cascade', action: 'Batch Generated 142 Certificates for Azure Bootcamp', time: '1 hour ago', module: 'Certificates' },
  { user: 'Admin Ananya', action: 'Published National Hackathon 2026 Winner Roster', time: '3 hours ago', module: 'Winners' }
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <ShieldCheck className="w-7 h-7 text-sky-400" /> Admin Command Console (§62)
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Real-time metrics, registration trends, certificate status, and community activity audit.
        </p>
      </div>

      {/* KPI Stat Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Community Members"
          value="1,240"
          description="Registered student accounts"
          icon={<Users className="w-6 h-6" />}
          accentColor="blue"
          trend={{ value: '18%', isPositive: true }}
        />
        <StatCard
          title="Events Conducted"
          value="35"
          description="Workshops & hackathons"
          icon={<Calendar className="w-6 h-6" />}
          accentColor="purple"
        />
        <StatCard
          title="Total Registrations"
          value="2,480"
          description="Across all events"
          icon={<FileCheck className="w-6 h-6" />}
          accentColor="emerald"
          trend={{ value: '24%', isPositive: true }}
        />
        <StatCard
          title="Certificates Generated"
          value="1,850"
          description="Verified PDF credentials"
          icon={<Award className="w-6 h-6" />}
          accentColor="amber"
        />
      </div>

      {/* Recharts Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6 space-y-4">
          <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">
            Registration & Attendance Growth Trend
          </h3>
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REGISTRATION_TREND}>
                <defs>
                  <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0078D4" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#0078D4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="registrations" stroke="#0078D4" fillOpacity={1} fill="url(#colorReg)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">
            Verified Check-ins Rate
          </h3>
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={REGISTRATION_TREND}>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} />
                <Bar dataKey="checkins" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Activity Feed */}
      <Card className="p-6 space-y-4 border-slate-800">
        <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
          <History className="w-5 h-5 text-sky-400" /> Recent Platform Activity Stream (§62)
        </h3>

        <div className="space-y-3">
          {RECENT_ACTIVITIES.map((act, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="primary" size="sm">{act.module}</Badge>
                  <span className="text-xs font-bold text-white">{act.user}</span>
                </div>
                <p className="text-xs text-slate-300">{act.action}</p>
              </div>

              <span className="text-[11px] text-slate-500 font-mono shrink-0">{act.time}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
