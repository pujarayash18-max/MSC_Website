'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { MessageSquare, Star, Send, CheckCircle2, Loader2 } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import type { Event } from '@/types';

async function fetchEvents(): Promise<Event[]> {
  const res = await fetch('/api/events');
  if (!res.ok) return [];
  const json = await res.json();
  return json.data?.events || [];
}

export default function StudentFeedbackPage() {
  const queryClient = useQueryClient();
  const { refreshUser } = useAuth();

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events-for-feedback'],
    queryFn: fetchEvents,
  });

  const [selectedEventId, setSelectedEventId] = useState('');
  const [rating, setRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetEventId = selectedEventId || events[0]?.id;
    if (!targetEventId || !feedbackText.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          eventId: targetEventId,
          rating,
          comments: feedbackText.trim(),
          suggestions: feedbackText.trim(),
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setSubmitted(true);
        toast.success(json.data?.message || 'Thank you! +5 Community Points credited to your account.');
        // Refresh auth context user profile & invalidate leaderboard/points queries
        await refreshUser();
        queryClient.invalidateQueries({ queryKey: ['public-community-leaderboard'] });
        queryClient.invalidateQueries({ queryKey: ['admin-leaderboard-students'] });
        queryClient.invalidateQueries({ queryKey: ['student-points-ledger'] });
      } else {
        toast.error(json.error || 'Failed to submit feedback.');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <MessageSquare className="w-7 h-7 text-[#00A4EF]" /> Event Feedback &amp; Surveys
        </h1>
        <p className="text-sm text-slate-600 dark:text-[#A8B0BB] mt-1">
          Share your experience for attended MCC workshops &amp; hackathons to earn community feedback points.
        </p>
      </div>

      <Card className="p-6 space-y-6 border-slate-200 dark:border-[#2A323D]">
        {submitted ? (
          <div className="p-8 text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-[#7FBA00] mx-auto animate-bounce" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Feedback Received!</h3>
            <p className="text-xs text-slate-600 dark:text-[#A8B0BB]">
              You earned <strong className="text-[#00A4EF] font-bold">+5 Community Points</strong> for helping improve MCC events.
            </p>
            <Button variant="outline" size="sm" onClick={() => setSubmitted(false)}>
              Submit Another Review
            </Button>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#00A4EF]" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-[#F5F7FA] block mb-1">Select Attended Event *</label>
              <select
                value={selectedEventId || (events[0]?.id ?? '')}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full p-2.5 text-xs bg-white dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A4EF] focus:outline-none"
              >
                {events.map((evt) => (
                  <option key={evt.id} value={evt.id}>
                    {evt.title} ({new Date(evt.startDate).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-[#F5F7FA] block mb-2">Overall Event Rating *</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 text-amber-400 focus:outline-none hover:scale-110 transition-transform"
                  >
                    <Star className={`w-6 h-6 ${rating >= star ? 'fill-amber-400' : 'text-slate-300 dark:text-slate-700'}`} />
                  </button>
                ))}
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-2">{rating} / 5 Stars</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-[#F5F7FA] block mb-1">Your Detailed Feedback &amp; Suggestions *</label>
              <textarea
                required
                rows={5}
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="What did you learn? What can we improve for the next workshop?"
                className="w-full p-3 text-xs bg-white dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A4EF] focus:outline-none placeholder-slate-400"
              />
            </div>

            <Button type="submit" variant="fluent" disabled={isSubmitting} className="w-full justify-center font-bold">
              <Send className="w-4 h-4" /> {isSubmitting ? 'Submitting...' : 'Submit Event Review'}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
