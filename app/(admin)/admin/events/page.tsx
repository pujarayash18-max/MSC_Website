'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Calendar, Plus, Edit3, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Event } from '@/types';

async function fetchAdminEvents(): Promise<Event[]> {
  const res = await fetch('/api/events');
  if (!res.ok) return [];
  const json = await res.json();
  return json.data?.events || [];
}

export default function AdminEventsPage() {
  const queryClient = useQueryClient();

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['admin-events'],
    queryFn: fetchAdminEvents,
  });

  const updateEventStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`/api/events/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ eventStatus: status }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Update failed');
      return json.data?.event;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      toast.success('Event status updated!');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Status update failed.');
    },
  });

  const handleStatusChange = (id: string, newStatus: string) => {
    updateEventStatusMutation.mutate({ id, status: newStatus });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-7 h-7 text-sky-400" /> Event Lifecycle Manager
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

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#00A4EF]" />
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-16 text-slate-500">No events created yet.</div>
      ) : (
        <div className="space-y-4">
          {events.map((evt) => (
            <Card key={evt.id} className="p-6 border-slate-200 dark:border-[#2A323D] bg-white dark:bg-[#151B23] space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Badge variant="primary">{evt.category}</Badge>
                    <Badge variant="purple">{evt.eventStatus || 'Published'}</Badge>
                    <span className="text-[11px] text-slate-500 font-mono">ID: {evt.id}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{evt.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-[#A8B0BB]">
                    {new Date(evt.startDate).toLocaleDateString()} • Venue: {evt.venue} • Seats: {evt.remainingSeats} / {evt.capacity}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={evt.eventStatus || 'Published'}
                    onChange={(e) => handleStatusChange(evt.id, e.target.value)}
                    className="p-2 text-xs bg-slate-50 dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="REGISTRATION_OPEN">Registration Open</option>
                    <option value="REGISTRATION_CLOSED">Registration Closed</option>
                    <option value="ONGOING">Ongoing</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>

                  <Link href={`/admin/events/${evt.id}/edit`}>
                    <Button variant="outline" size="sm" className="gap-1">
                      <Edit3 className="w-3.5 h-3.5" /> Edit
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
