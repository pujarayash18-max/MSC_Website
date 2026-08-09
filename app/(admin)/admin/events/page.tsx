'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { INITIAL_EVENTS } from '@/lib/services/dataService';
import { EventStatus } from '@/types';
import { toast } from 'sonner';
import { Calendar, Plus, Edit3, Copy, Archive, CheckCircle, XCircle } from 'lucide-react';

function formatDateDeterministic(dateString: string): string {
  const date = new Date(dateString);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState(INITIAL_EVENTS);

  const handleStatusChange = (id: string, newStatus: EventStatus) => {
    setEvents((prev) =>
      prev.map((e) => (e.eventId === id ? { ...e, eventStatus: newStatus } : e))
    );
    toast.success(`Event status transitioned to "${newStatus}"! Student portal updated.`);
  };

  const handleDuplicate = (title: string) => {
    toast.success(`Duplicated event "${title}" as Draft.`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Calendar className="w-7 h-7 text-sky-400" /> Event Lifecycle Manager
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Create events, build agenda timelines, manage registration status, and archive completed events.
          </p>
        </div>

        <Link href="/admin/events/new">
          <Button variant="fluent" size="sm">
            <Plus className="w-4 h-4" /> Create New Event
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {events.map((evt) => (
          <Card key={evt.eventId} className="p-6 border-slate-800 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Badge variant="primary">{evt.category}</Badge>
                  <Badge variant="purple">{evt.eventStatus}</Badge>
                  <span className="text-[11px] text-slate-500 font-mono">ID: {evt.eventId}</span>
                </div>
                <h3 className="text-lg font-bold text-white">{evt.title}</h3>
                <p className="text-xs text-slate-400">
                  {formatDateDeterministic(evt.startDate)} • Venue: {evt.venue} • Seats Left: {evt.remainingSeats}/{evt.capacity}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Status Transitions (§63) */}
                <select
                  value={evt.eventStatus}
                  onChange={(e) => handleStatusChange(evt.eventId, e.target.value as EventStatus)}
                  className="text-xs bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-sky-500"
                >
                  <option value="Draft">Draft</option>
                  <option value="Published">Published</option>
                  <option value="Registration Open">Registration Open</option>
                  <option value="Registration Closed">Registration Closed</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Archived">Archived</option>
                </select>

                <Button variant="outline" size="sm" onClick={() => handleDuplicate(evt.title)}>
                  <Copy className="w-3.5 h-3.5" /> Clone
                </Button>

                <Link href={`/admin/events/${evt.eventId}/edit`}>
                  <Button variant="fluent" size="sm">
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
