'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Bell, CheckCircle2, AlertTriangle, AlertCircle, Info, Check } from 'lucide-react';

const MOCK_STUDENT_NOTIFICATIONS = [
  {
    id: 'n1',
    title: 'Azure Masterclass QR Pass Ready',
    message: 'Your registration for Azure Cloud Architecture Masterclass has been approved. Access your QR Pass in My Registrations.',
    type: 'success',
    time: '10 mins ago',
    read: false
  },
  {
    id: 'n2',
    title: 'Live Workshop Starter Code Uploaded',
    message: 'Prof. Amit Patel uploaded sample Azure Functions code to the Resources portal.',
    type: 'info',
    time: '2 hours ago',
    read: false
  },
  {
    id: 'n3',
    title: 'Hackathon Team Submission Deadline',
    message: 'Reminder: Link your GitHub repository before Aug 24, 11:59 PM.',
    type: 'warning',
    time: '1 day ago',
    read: true
  }
];

export default function StudentNotificationsPage() {
  const [notifications, setNotifications] = useState(MOCK_STUDENT_NOTIFICATIONS);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success('All notifications marked as read.');
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-7 h-7 text-[#00A4EF]" /> Notification Center (§28)
          </h1>
          <p className="text-sm text-slate-600 dark:text-[#A8B0BB] mt-1">
            Real-time notifications regarding registration status, live resources, and certificate releases.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={markAllRead}>
          <Check className="w-4 h-4" /> Mark All as Read
        </Button>
      </div>

      <div className="space-y-3">
        {notifications.map((n) => {
          let typeColor = 'border-[#00A4EF] bg-[#00A4EF]/10 text-[#00A4EF]';
          let Icon = Info;
          if (n.type === 'success') {
            typeColor = 'border-[#7FBA00] bg-[#7FBA00]/10 text-[#7FBA00]';
            Icon = CheckCircle2;
          } else if (n.type === 'warning') {
            typeColor = 'border-[#FFB900] bg-[#FFB900]/10 text-[#FFB900]';
            Icon = AlertTriangle;
          } else if (n.type === 'danger') {
            typeColor = 'border-[#F25022] bg-[#F25022]/10 text-[#F25022]';
            Icon = AlertCircle;
          }

          return (
            <Card key={n.id} className={`p-5 space-y-2 border-slate-200 dark:border-[#2A323D] ${!n.read ? 'border-l-4 border-l-[#00A4EF]' : ''}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg border ${typeColor}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{n.title}</h4>
                  {!n.read && <Badge variant="primary" size="sm">New</Badge>}
                </div>
                <span className="text-[11px] text-slate-500 dark:text-[#A8B0BB]">{n.time}</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-[#A8B0BB] pl-8">{n.message}</p>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
