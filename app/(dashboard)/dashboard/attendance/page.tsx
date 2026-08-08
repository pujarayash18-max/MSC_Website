'use client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { QrCode, CheckCircle, Calendar, Clock } from 'lucide-react';

const MOCK_ATTENDANCE_HISTORY = [
  { event: 'Azure Cloud Masterclass', date: 'Aug 25, 2026', checkIn: '09:32 AM', status: 'Present' },
  { event: 'GitHub Open Source Bootcamp', date: 'Jul 20, 2026', checkIn: '10:05 AM', status: 'Present' },
  { event: 'AI & Copilot Seminar', date: 'Jun 15, 2026', checkIn: '09:45 AM', status: 'Present' },
  { event: 'React & Next.js Workshop', date: 'May 10, 2026', checkIn: '-', status: 'Absent' }
];

const CHART_DATA = [
  { month: 'May', attendance: 50 },
  { month: 'Jun', attendance: 100 },
  { month: 'Jul', attendance: 100 },
  { month: 'Aug', attendance: 100 }
];

export default function StudentAttendancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <QrCode className="w-7 h-7 text-sky-400" /> Attendance History & Analytics (§47)
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Track your QR check-in history, entry timestamps, and monthly attendance percentages.
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 text-center">
          <p className="text-xs font-semibold uppercase text-slate-400">Total Check-ins</p>
          <h3 className="text-3xl font-extrabold text-white mt-1">3 Events</h3>
          <p className="text-xs text-emerald-400 mt-1">100% Verified via QR Pass</p>
        </Card>

        <Card className="p-6 text-center">
          <p className="text-xs font-semibold uppercase text-slate-400">Overall Attendance Rate</p>
          <h3 className="text-3xl font-extrabold text-white mt-1">95%</h3>
          <p className="text-xs text-sky-400 mt-1">Eligible for Participation Certificates</p>
        </Card>

        <Card className="p-6 text-center">
          <p className="text-xs font-semibold uppercase text-slate-400">Punctuality Score</p>
          <h3 className="text-3xl font-extrabold text-white mt-1">On Time</h3>
          <p className="text-xs text-purple-400 mt-1">Average entry before 09:40 AM</p>
        </Card>
      </div>

      {/* Chart & History List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recharts Bar Chart */}
        <Card className="p-6 space-y-4">
          <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">Monthly Attendance Trend</h3>
          <div className="h-48 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CHART_DATA}>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                  itemStyle={{ color: '#38bdf8' }}
                />
                <Bar dataKey="attendance" radius={[8, 8, 0, 0]}>
                  {CHART_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.attendance >= 75 ? '#0078D4' : '#f43f5e'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* History Table */}
        <Card className="p-6 space-y-4 lg:col-span-2">
          <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">Check-in Log</h3>
          <div className="space-y-3">
            {MOCK_ATTENDANCE_HISTORY.map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-white">{item.event}</h4>
                  <p className="text-[11px] text-slate-400 flex items-center gap-3">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-sky-400" /> {item.date}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-sky-400" /> Entry: {item.checkIn}</span>
                  </p>
                </div>

                <Badge variant={item.status === 'Present' ? 'success' : 'danger'}>
                  {item.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
