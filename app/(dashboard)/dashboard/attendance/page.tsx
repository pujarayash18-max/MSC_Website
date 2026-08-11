'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { QrCode, Calendar, Clock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface AttendanceRecord {
  id: string;
  checkInTime: string;
  status: string;
  event: {
    id: string;
    title: string;
    startDate: string;
    category: string;
  };
}

async function fetchAttendance() {
  const res = await fetch('/api/attendance', { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch attendance');
  const json = await res.json();
  return json.data as { attendances: AttendanceRecord[]; attendancePercentage: number };
}

export default function StudentAttendancePage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['attendance'],
    queryFn: fetchAttendance,
  });

  const attendanceRecords = data?.attendances ?? [];
  const attendancePercentage = data?.attendancePercentage ?? 100;
  const presentCount = attendanceRecords.filter((r) => r.status === 'PRESENT').length;

  // Build chart from real data grouped by month
  const monthMap = new Map<string, number>();
  attendanceRecords.forEach((r) => {
    const month = new Date(r.checkInTime).toLocaleString('default', { month: 'short' });
    monthMap.set(month, (monthMap.get(month) ?? 0) + 1);
  });
  const chartData = Array.from(monthMap.entries())
    .slice(-6)
    .map(([month, count]) => ({ month, attendance: count }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#00A4EF]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 text-red-500">
        Failed to load attendance data. Please refresh.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <QrCode className="w-7 h-7 text-[#00A4EF]" /> Attendance History &amp; Analytics
        </h1>
        <p className="text-sm text-slate-600 dark:text-[#A8B0BB] mt-1">
          Track your QR check-in history, entry timestamps, and monthly attendance percentages.
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 text-center border-slate-200 dark:border-[#2A323D]">
          <p className="text-xs font-semibold uppercase text-slate-500 dark:text-[#A8B0BB]">Total Verified Check-ins</p>
          <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{presentCount} Events</h3>
          <p className="text-xs text-[#7FBA00] font-semibold mt-1">Verified via QR Scanner</p>
        </Card>

        <Card className="p-6 text-center border-slate-200 dark:border-[#2A323D]">
          <p className="text-xs font-semibold uppercase text-slate-500 dark:text-[#A8B0BB]">Overall Attendance Rate</p>
          <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{attendancePercentage}%</h3>
          <p className="text-xs text-[#00A4EF] font-semibold mt-1">Eligible for Certificates</p>
        </Card>

        <Card className="p-6 text-center border-slate-200 dark:border-[#2A323D]">
          <p className="text-xs font-semibold uppercase text-slate-500 dark:text-[#A8B0BB]">Punctuality Status</p>
          <h3 className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">On Time</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Entry scanned before keynote</p>
        </Card>
      </div>

      {/* Chart & History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 space-y-4 border-slate-200 dark:border-[#2A323D]">
          <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-[#2A323D] pb-3">
            Monthly Attendance Trend
          </h3>
          <div className="h-48 w-full pt-4">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="month" stroke="#A8B0BB" fontSize={12} tickLine={false} />
                  <YAxis stroke="#A8B0BB" fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#151B23', borderColor: '#2A323D', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="attendance" radius={[4, 4, 0, 0]}>
                    {chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#00A4EF' : '#7FBA00'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-slate-500">No data yet</div>
            )}
          </div>
        </Card>

        <Card className="lg:col-span-2 p-6 space-y-4 border-slate-200 dark:border-[#2A323D]">
          <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-[#2A323D] pb-3">
            Verified Event Check-ins
          </h3>

          {attendanceRecords.length === 0 ? (
            <div className="text-center py-10 text-slate-500 dark:text-slate-400 text-sm">
              No attendance records yet. Register for an event and check in via QR!
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-[#2A323D]">
              {attendanceRecords.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {item.event?.title ?? item.id}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-[#A8B0BB]">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#00A4EF]" />
                        {new Date(item.checkInTime).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#7FBA00]" />
                        {new Date(item.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  <Badge
                    variant={item.status === 'PRESENT' ? 'success' : 'danger'}
                    className="flex items-center gap-1"
                  >
                    {item.status === 'PRESENT' ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : (
                      <AlertCircle className="w-3 h-3" />
                    )}
                    {item.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
