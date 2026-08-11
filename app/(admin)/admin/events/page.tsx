'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { dynamicDb } from '@/lib/services/dataService';
import { Event, EventStatus } from '@/types';
import { toast } from 'sonner';
import { Calendar, Plus, Edit3, Copy, Trash2 } from 'lucide-react';

function formatDateDeterministic(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
  } catch {
    return dateString;
  }
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>(() => dynamicDb.getEvents());

  const handleStatusChange = (id: string, newStatus: EventStatus) => {
    const target = events.find((e) => e.eventId === id || e.id === id);
    if (!target) return;
    const updatedEvent: Event = { ...target, eventStatus: newStatus, updatedAt: new Date().toISOString() };
    dynamicDb.saveEvent(updatedEvent);
    setEvents(dynamicDb.getEvents());
    toast.success(`Event status transitioned to "${newStatus}"! Student portal updated.`);
  };

  const handleDuplicate = (evt: Event) => {
    const newId = `evt_clone_${Date.now()}`;
    const duplicatedEvent: Event = {
      ...evt,
      id: newId,
      eventId: newId,
      title: `${evt.title} (Copy)`,
      eventStatus: 'Draft',
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    dynamicDb.saveEvent(duplicatedEvent);
    setEvents(dynamicDb.getEvents());
    toast.success(`Duplicated event "${evt.title}" as Draft!`);
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete event "${title}"?`)) {
      dynamicDb.deleteEvent(id);
      setEvents(dynamicDb.getEvents());
      toast.success(`Event "${title}" has been deleted.`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-7 h-7 text-[#00A4EF]" /> Event Lifecycle Manager
          </h1>
          <p className="text-sm text-slate-600 dark:text-[#A8B0BB] mt-1">
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
          <Card key={evt.eventId || evt.id} className="p-6 border-slate-200 dark:border-[#2A323D] space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Badge variant="primary">{evt.category}</Badge>
                  <Badge variant="purple">{evt.eventStatus}</Badge>
                  <span className="text-[11px] text-slate-500 dark:text-[#A8B0BB] font-mono">ID: {evt.eventId || evt.id}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{evt.title}</h3>
                <p className="text-xs text-slate-600 dark:text-[#A8B0BB]">
                  {formatDateDeterministic(evt.startDate)} • Venue: {evt.venue} • Seats Left: {evt.remainingSeats ?? evt.capacity}/{evt.capacity}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Status Transitions (§63) */}
                <select
                  value={evt.eventStatus}
                  onChange={(e) => handleStatusChange(evt.eventId || evt.id, e.target.value as EventStatus)}
                  className="text-xs bg-white dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A4EF]"
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

                <Button variant="outline" size="sm" onClick={() => handleDuplicate(evt)}>
                  <Copy className="w-3.5 h-3.5" /> Clone
                </Button>

                <Link href={`/admin/events/${evt.eventId || evt.id}/edit`}>
                  <Button variant="fluent" size="sm">
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </Button>
                </Link>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(evt.eventId || evt.id, evt.title)}
                  className="text-rose-400 border-rose-500/30 hover:bg-rose-500/10"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
