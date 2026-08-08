'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, CheckCircle2, Award, Calendar, Sparkles, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function StudentNotificationsPage() {
  const [notifications, setNotifications] = useState([
    {
      id: 'notif_01',
      title: 'Registration Approved: Azure Serverless Bootcamp',
      message: 'Your registration has been confirmed. Unique QR pass generated in your dashboard.',
      time: '2 hours ago',
      type: 'registration',
      read: false
    },
    {
      id: 'notif_02',
      title: 'Certificate Issued: AI & ML Workshop',
      message: 'Your Verified Certificate of Participation is ready for download.',
      time: '1 day ago',
      type: 'certificate',
      read: true
    },
    {
      id: 'notif_03',
      title: 'Winner Announced: Azure Cloud Hackathon',
      message: 'Congratulations! Team CyberCraft placed 1st. +100 Points awarded.',
      time: '3 days ago',
      type: 'winner',
      read: true
    }
  ]);

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
    toast.success('All notifications marked as read.');
  };

  const clearAll = () => {
    setNotifications([]);
    toast.info('Notifications cleared.');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Bell className="w-7 h-7 text-sky-400" /> Notifications & Alerts (§71)
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time updates regarding event registrations, waitlists, certificates, and community points.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={markAllRead}>
            Mark All Read
          </Button>
          <Button variant="secondary" size="sm" onClick={clearAll}>
            <Trash2 className="w-3.5 h-3.5 text-rose-400" /> Clear
          </Button>
        </div>
      </div>

      <Card className="p-6 border-slate-800 space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-12 text-slate-500 space-y-2">
            <Bell className="w-12 h-12 mx-auto text-slate-600" />
            <p className="text-xs">No notifications right now.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-xl border flex items-start justify-between gap-4 transition-colors ${
                !n.read
                  ? 'bg-sky-500/10 border-sky-500/30 text-white'
                  : 'bg-slate-950 border-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                  {n.type === 'registration' && <Calendar className="w-4 h-4 text-sky-400" />}
                  {n.type === 'certificate' && <Award className="w-4 h-4 text-amber-400" />}
                  {n.type === 'winner' && <Sparkles className="w-4 h-4 text-emerald-400" />}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-white">{n.title}</h3>
                    {!n.read && <Badge variant="primary" size="sm">New</Badge>}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{n.message}</p>
                  <span className="text-[10px] text-slate-500 block pt-1">{n.time}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </Card>
    </div>
  );
}
