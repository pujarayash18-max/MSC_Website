'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Event } from '@/types';
import { Search, Calendar, MapPin, Users, Clock, ArrowRight } from 'lucide-react';

const FILTERS = ['All Events', 'Upcoming', 'Ongoing', 'Completed', 'Workshop', 'Hackathon', 'Bootcamp', 'Azure', 'AI'];

interface EventFilterCatalogProps {
  events: Event[];
}

export function EventFilterCatalog({ events }: EventFilterCatalogProps) {
  const [selectedFilter, setSelectedFilter] = useState('All Events');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEvents = events.filter((evt) => {
    const matchesFilter =
      selectedFilter === 'All Events' ||
      evt.category === selectedFilter ||
      evt.eventStatus === selectedFilter ||
      evt.tags.includes(selectedFilter);

    const matchesSearch =
      evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                selectedFilter === filter
                  ? 'bg-sky-600 text-white font-semibold shadow-md shadow-sky-600/25'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search events by title, tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
          />
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((evt) => (
          <Card key={evt.id} className="flex flex-col h-full overflow-hidden">
            <div className="h-44 relative overflow-hidden bg-slate-950">
              <img src={evt.banner} alt={evt.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
              <div className="absolute top-3 right-3 flex gap-2">
                <Badge variant={evt.eventStatus === 'Upcoming' ? 'primary' : 'outline'}>{evt.eventStatus}</Badge>
              </div>
            </div>

            <div className="p-6 flex flex-col flex-1 space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="purple" size="sm">{evt.category}</Badge>
                <Badge variant="outline" size="sm">{evt.mode}</Badge>
              </div>

              <h2 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-2">{evt.title}</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{evt.shortDescription}</p>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2 text-xs text-slate-700 dark:text-slate-300 mt-auto">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" /> Aug 25, 2026</span>
                  <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" /> Full Day</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" /> {evt.venue}</span>
                  <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> {evt.remainingSeats} Seats Left</span>
                </div>
              </div>

              <div className="pt-3">
                <Link href={`/events/${evt.slug}`} className="w-full">
                  <Button variant="fluent" className="w-full justify-between" size="sm">
                    <span>View Event & Register</span>
                    <ArrowRight className="w-4 h-4" />
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
