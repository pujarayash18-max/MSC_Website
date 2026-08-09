'use client';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { NotificationType } from '@/types';
import { toast } from 'sonner';
import { Send, Bell, Mail } from 'lucide-react';

export default function AdminNotificationsPage() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<NotificationType>('Event Reminder');
  const [sendEmail, setSendEmail] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;

    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      toast.success(`Broadcasted notification "${title}" to 1,240 active student dashboards!`);
      setTitle('');
      setMessage('');
    }, 600);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Send className="w-7 h-7 text-[#0078D4] dark:text-[#00A4EF]" /> Push Notifications & Email Alerts (§82)
        </h1>
        <p className="text-sm text-slate-600 dark:text-[#A8B0BB] mt-1">
          Broadcast in-app notifications and automated emails to registered students.
        </p>
      </div>

      <Card className="p-6 space-y-4 border-slate-200 dark:border-[#2A323D] bg-white dark:bg-[#151B23]">
        <form onSubmit={handleSend} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Notification Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as NotificationType)}
              className="w-full p-2.5 text-xs bg-slate-50 dark:bg-[#0D1117] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0078D4] dark:focus:ring-[#00A4EF]"
            >
              <option value="Event Reminder" className="bg-white dark:bg-[#151B23]">Event Reminder</option>
              <option value="Live Resource Available" className="bg-white dark:bg-[#151B23]">Live Resource Available</option>
              <option value="Certificate Ready" className="bg-white dark:bg-[#151B23]">Certificate Ready</option>
              <option value="Winner Announcement" className="bg-white dark:bg-[#151B23]">Winner Announcement</option>
              <option value="New Notice" className="bg-white dark:bg-[#151B23]">New Notice</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Notification Headline *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Live Coding Resources Uploaded for Azure Masterclass"
              className="w-full p-2.5 text-xs bg-slate-50 dark:bg-[#0D1117] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#0078D4] dark:focus:ring-[#00A4EF]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Notification Body Message *</label>
            <textarea
              rows={3}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Detailed notification message text..."
              className="w-full p-2.5 text-xs bg-slate-50 dark:bg-[#0D1117] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#0078D4] dark:focus:ring-[#00A4EF]"
            />
          </div>

          <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={sendEmail}
              onChange={(e) => setSendEmail(e.target.checked)}
              className="rounded text-[#0078D4] dark:text-[#00A4EF]"
            />
            Also deliver via Azure Communication Services / SendGrid Email
          </label>

          <div className="pt-2 flex justify-end">
            <Button type="submit" variant="fluent" size="lg" isLoading={isSending}>
              <Send className="w-4 h-4" /> Broadcast Notification
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
