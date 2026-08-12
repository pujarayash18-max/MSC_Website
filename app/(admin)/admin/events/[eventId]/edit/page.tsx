'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import type { Event } from '@/types';

interface EditEventPageProps {
  params: Promise<{ eventId: string }>;
}

export default function EditEventPage({ params }: EditEventPageProps) {
  const resolvedParams = use(params);
  const eventId = resolvedParams.eventId;

  const [, setEvent] = useState<Event | null>(null);
  const [title, setTitle] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [category, setCategory] = useState('Workshop');
  const [mode, setMode] = useState('Offline');
  const [venue, setVenue] = useState('');
  const [capacity, setCapacity] = useState(100);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/events/${encodeURIComponent(eventId)}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data?.event) {
          const e: Event = json.data.event;
          setEvent(e);
          setTitle(e.title);
          setShortDesc(e.shortDescription);
          setCategory(e.category);
          setMode(e.mode);
          setVenue(e.venue);
          setCapacity(e.capacity);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [eventId]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !shortDesc.trim()) return;

    setIsSaving(true);
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: title.trim(),
          shortDescription: shortDesc.trim(),
          category,
          mode,
          venue: venue.trim(),
          capacity: Number(capacity),
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        toast.success(`Event "${title}" updated successfully!`);
      } else {
        toast.error(json.error || 'Update failed.');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#00A4EF]" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/admin/events">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4" /> Back to Events
          </Button>
        </Link>
      </div>

      <form onSubmit={handleUpdate} className="space-y-6">
        <Card className="p-6 space-y-4 border-slate-200 dark:border-[#2A323D] bg-white dark:bg-[#151B23]">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Edit Event Details</h2>

          <div className="space-y-2">
            <label className="text-xs font-bold block">Event Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2.5 text-xs bg-slate-50 dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold block">Short Summary *</label>
            <textarea
              rows={2}
              required
              value={shortDesc}
              onChange={(e) => setShortDesc(e.target.value)}
              className="w-full p-2.5 text-xs bg-slate-50 dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold block mb-1">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 text-xs bg-slate-50 dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="Workshop">Workshop</option>
                <option value="Hackathon">Hackathon</option>
                <option value="Bootcamp">Bootcamp</option>
                <option value="Webinar">Webinar</option>
                <option value="Conference">Conference</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold block mb-1">Event Mode *</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="w-full p-2.5 text-xs bg-slate-50 dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="Offline">Offline</option>
                <option value="Online">Online</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold block mb-1">Capacity *</label>
              <input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="w-full p-2.5 text-xs bg-slate-50 dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold block mb-1">Venue Location *</label>
            <input
              type="text"
              required
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              className="w-full p-2.5 text-xs bg-slate-50 dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <Button type="submit" variant="fluent" disabled={isSaving} className="w-full font-bold justify-center">
            <Save className="w-4 h-4" /> {isSaving ? 'Saving Changes...' : 'Save Event Changes'}
          </Button>
        </Card>
      </form>
    </div>
  );
}
