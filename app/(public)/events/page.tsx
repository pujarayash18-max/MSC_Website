import { Badge } from '@/components/ui/badge';
import { INITIAL_EVENTS } from '@/lib/services/dataService';
import { EventFilterCatalog } from '@/components/events/EventFilterCatalog';

export default function EventsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 py-8">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <Badge variant="primary">MCC Events Catalog</Badge>
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">Workshops, Hackathons & Bootcamps</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">Discover upcoming Microsoft events, register with dynamic forms, track seat capacity, and earn community points.</p>
      </div>

      {/* Filter Catalog */}
      <EventFilterCatalog events={INITIAL_EVENTS} />
    </div>
  );
}
