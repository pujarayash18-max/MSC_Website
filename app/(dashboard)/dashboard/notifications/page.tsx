'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Bell, CheckCircle2, AlertTriangle, AlertCircle, Info, Check, Loader2 } from 'lucide-react';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type?: string;
  isRead: boolean;
  createdAt: string;
  link?: string;
}

function formatRelativeTime(dateStr: string) {
  try {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins} mins ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    return `${days} days ago`;
  } catch {
    return 'Recently';
  }
}

export default function StudentNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (res.ok && data.data?.notifications) {
        setNotifications(data.data.notifications);
      }
    } catch (e) {
      console.error('Failed to load notifications', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllRead = async () => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        toast.success('All notifications marked as read.');
      }
    } catch (e) {
      toast.error('Failed to mark notifications as read');
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-7 h-7 text-[#00A4EF]" /> Notification Center
          </h1>
          <p className="text-sm text-slate-600 dark:text-[#A8B0BB] mt-1">
            Real-time notifications regarding registration status, live resources, and certificate releases.
          </p>
        </div>

        {notifications.length > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead}>
            <Check className="w-4 h-4" /> Mark All as Read
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-12 text-slate-500">
          <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading real-time notifications...
        </div>
      ) : notifications.length === 0 ? (
        <Card className="p-12 text-center border-slate-200 dark:border-[#2A323D] bg-white dark:bg-[#151B23]">
          <Bell className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No Notifications Yet</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            You're all caught up! Automated notices, event reminders, and announcements will appear here.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => {
            let typeColor = 'border-[#00A4EF] bg-[#00A4EF]/10 text-[#00A4EF]';
            let Icon = Info;

            const t = n.type?.toUpperCase() || '';
            if (t.includes('CERTIFICATE') || t.includes('SUCCESS') || t.includes('APPROVED')) {
              typeColor = 'border-[#7FBA00] bg-[#7FBA00]/10 text-[#7FBA00]';
              Icon = CheckCircle2;
            } else if (t.includes('DEADLINE') || t.includes('WARNING') || t.includes('WINNER')) {
              typeColor = 'border-[#FFB900] bg-[#FFB900]/10 text-[#FFB900]';
              Icon = AlertTriangle;
            } else if (t.includes('REJECTED') || t.includes('DANGER')) {
              typeColor = 'border-[#F25022] bg-[#F25022]/10 text-[#F25022]';
              Icon = AlertCircle;
            }

            return (
              <Card
                key={n.id}
                className={`p-5 space-y-2 border-slate-200 dark:border-[#2A323D] bg-white dark:bg-[#151B23] ${
                  !n.isRead ? 'border-l-4 border-l-[#00A4EF]' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg border ${typeColor}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{n.title}</h4>
                    {!n.isRead && <Badge variant="primary" size="sm">New</Badge>}
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-[#A8B0BB]">
                    {formatRelativeTime(n.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-[#A8B0BB] pl-8">{n.message}</p>
                {n.link && (
                  <div className="pl-8 pt-1">
                    <a
                      href={n.link}
                      className="text-xs font-semibold text-[#00A4EF] hover:underline"
                    >
                      View Details →
                    </a>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
