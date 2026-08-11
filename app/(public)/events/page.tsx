import { Badge } from '@/components/ui/badge';
import { EventFilterCatalog } from '@/components/events/EventFilterCatalog';
import type { Event } from '@/types';

async function getEvents(): Promise<Event[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/events`, {
      next: { revalidate: 60 }, // ISR — revalidate every 60 seconds
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data?.events ?? [];
  } catch {
    return [];
  }
}

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 py-8">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <Badge variant="primary">MCC Events Catalog</Badge>
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">
          Workshops, Hackathons &amp; Bootcamps
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Discover upcoming Microsoft events, register with dynamic forms, track seat capacity, and earn community points.
        </p>
      </div>

      {/* Filter Catalog — receives real data from DB */}
      <EventFilterCatalog events={events} />
    </div>
  );
}
