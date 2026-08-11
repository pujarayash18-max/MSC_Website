'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { QrCode, Calendar, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { dynamicDb } from '@/lib/services/dataService';
import { useEffect, useState } from 'react';
import { Attendance } from '@/types/event';

export default function StudentAttendancePage() {
  const { user } = useAuth();
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
      const allRecords = dynamicDb.getAttendance();
      const userRecords = user
        ? allRecords.filter((r) => r.userId === user.userId || r.userId === user.id || r.userId === 'usr_superadmin_001')
        : allRecords;
      setAttendanceRecords(userRecords);
    }, 0);
    return () => clearTimeout(timer);
  }, [user]);

  const presentCount = attendanceRecords.filter((r) => r.status === 'Present').length;
  const totalEvents = Math.max(attendanceRecords.length, 4);
  const attendancePercentage = totalEvents > 0 ? Math.round((presentCount / totalEvents) * 100) : 100;

  const chartData = [
    { month: 'Jun', attendance: 100 },
    { month: 'Jul', attendance: 100 },
    { month: 'Aug', attendance: attendancePercentage }
  ];

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <QrCode className="w-7 h-7 text-[#00A4EF]" /> Attendance History & Analytics
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

      {/* Chart & History List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recharts Bar Chart */}
        <Card className="p-6 space-y-4 border-slate-200 dark:border-[#2A323D]">
          <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-[#2A323D] pb-3">Monthly Attendance Trend</h3>
          <div className="h-48 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="month" stroke="#A8B0BB" fontSize={12} tickLine={false} />
                <YAxis stroke="#A8B0BB" fontSize={12} tickLine={false} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#151B23', borderColor: '#2A323D', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="attendance" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#00A4EF' : '#7FBA00'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* History Table */}
        <Card className="lg:col-span-2 p-6 space-y-4 border-slate-200 dark:border-[#2A323D]">
          <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-[#2A323D] pb-3">Verified Event Check-ins</h3>
          
          <div className="divide-y divide-slate-200 dark:divide-[#2A323D]">
            {attendanceRecords.map((item) => (
              <div key={item.attendanceId || item.id} className="py-3 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{item.eventId}</h4>
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-[#A8B0BB]">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#00A4EF]" /> {new Date(item.checkInTime).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#7FBA00]" /> {new Date(item.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                <Badge variant={item.status === 'Present' ? 'success' : 'danger'} className="flex items-center gap-1">
                  {item.status === 'Present' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
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
