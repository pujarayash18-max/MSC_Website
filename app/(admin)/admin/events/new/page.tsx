'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ArrowLeft, Save, Plus } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

export default function NewEventPage() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [category, setCategory] = useState('Workshop');
  const [mode, setMode] = useState('Offline');
  const [venue, setVenue] = useState('Seminar Hall 4, Main Campus');
  const [meetingUrl, setMeetingUrl] = useState('');
  const [capacity, setCapacity] = useState(150);
  const [agenda, setAgenda] = useState([
    { id: '1', time: '09:30 AM', title: 'Welcome & Registration', speaker: 'Faculty Coordinator', room: 'Hall 4' }
  ]);
  const [isSaving, setIsSaving] = useState(false);

  const addAgendaItem = () => {
    setAgenda([...agenda, { id: Date.now().toString(), time: '10:00 AM', title: 'Technical Session', speaker: 'Speaker', room: 'Lab 204' }]);
  };

  const router = useRouter();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      toast.error('Event title is required.');
      return;
    }

    const finalVenue =
      mode === 'Online'
        ? (meetingUrl.trim() || 'https://teams.microsoft.com')
        : mode === 'Hybrid' && meetingUrl.trim()
        ? `${venue.trim()} (Teams: ${meetingUrl.trim()})`
        : venue.trim();

    setIsSaving(true);
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          shortDescription: shortDesc || 'Hands-on intensive workshop by Microsoft Campus Club.',
          category: category.toUpperCase(),
          mode: mode.toUpperCase(),
          venue: finalVenue,
          capacity: capacity || 150,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        queryClient.invalidateQueries({ queryKey: ['admin-events'] });
        queryClient.invalidateQueries({ queryKey: ['master-home-data'] });
        queryClient.invalidateQueries({ queryKey: ['public-stats'] });
        toast.success(`Event "${title}" created and published!`);
        router.push('/admin/events');
      } else {
        toast.error(json.error || 'Failed to create event.');
      }
    } catch {
      toast.error('Network error creating event.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/admin/events">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4" /> Back to Events
          </Button>
        </Link>
      </div>

      <form onSubmit={handleCreate} className="space-y-6">
        <Card className="p-6 space-y-4 border-sky-500/30">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3">Create New Club Event</h2>

          <div className="space-y-4 text-xs">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Event Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Azure AI & Generative Workflows Bootcamp"
                className="w-full p-3 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white"
                >
                  <option value="Workshop">Workshop</option>
                  <option value="Hackathon">Hackathon</option>
                  <option value="Bootcamp">Bootcamp</option>
                  <option value="Webinar">Webinar</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Event Mode</label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white"
                >
                  <option value="Offline">Offline</option>
                  <option value="Online">Online</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Max Capacity</label>
                <input
                  type="number"
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white"
                />
              </div>
            </div>

            {(mode === 'Online' || mode === 'Hybrid') && (
              <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 space-y-2">
                <label className="text-indigo-300 font-bold block">
                  Microsoft Teams / Meeting Link {mode === 'Online' ? '*' : '(Optional)'}
                </label>
                <input
                  type="url"
                  required={mode === 'Online'}
                  value={meetingUrl}
                  onChange={(e) => setMeetingUrl(e.target.value)}
                  placeholder="https://teams.microsoft.com/l/meetup-join/..."
                  className="w-full p-2.5 bg-slate-900 border border-indigo-500/40 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <p className="text-[11px] text-slate-400">
                  Students will be automatically redirected to this link when they click &quot;Join MS Teams Session&quot; after registration.
                </p>
              </div>
            )}

            {mode !== 'Online' && (
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Physical Venue Location</label>
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="Seminar Hall 4, Main Campus"
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white"
                />
              </div>
            )}

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Short Description</label>
              <textarea
                rows={2}
                value={shortDesc}
                onChange={(e) => setShortDesc(e.target.value)}
                placeholder="Brief summary for event cards and homepage banners..."
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white"
              />
            </div>
          </div>
        </Card>

        {/* Agenda Builder Section */}
        <Card className="p-6 space-y-4 border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Event Agenda Builder</h3>
            <Button type="button" variant="outline" size="sm" onClick={addAgendaItem}>
              <Plus className="w-4 h-4" /> Add Agenda Session
            </Button>
          </div>

          <div className="space-y-3">
            {agenda.map((ag, idx) => (
              <div key={ag.id} className="p-4 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
                <input
                  type="text"
                  value={ag.time}
                  onChange={(e) => {
                    const copy = [...agenda];
                    copy[idx].time = e.target.value;
                    setAgenda(copy);
                  }}
                  className="p-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white"
                />
                <input
                  type="text"
                  value={ag.title}
                  onChange={(e) => {
                    const copy = [...agenda];
                    copy[idx].title = e.target.value;
                    setAgenda(copy);
                  }}
                  placeholder="Session Title"
                  className="p-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white md:col-span-2"
                />
                <button
                  type="button"
                  onClick={() => setAgenda(agenda.filter((a) => a.id !== ag.id))}
                  className="text-rose-400 text-xs text-right font-medium hover:underline"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" variant="fluent" size="lg" isLoading={isSaving}>
            <Save className="w-4 h-4" /> Create & Save Draft Event
          </Button>
        </div>
      </form>
    </div>
  );
}
