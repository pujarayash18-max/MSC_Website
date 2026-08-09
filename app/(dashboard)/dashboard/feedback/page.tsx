'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { INITIAL_EVENTS } from '@/lib/services/dataService';
import { toast } from 'sonner';
import { MessageSquare, Star, Send, CheckCircle2 } from 'lucide-react';

export default function StudentFeedbackPage() {
  const [selectedEventId, setSelectedEventId] = useState(INITIAL_EVENTS[0].eventId);
  const [rating, setRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      toast.success('Thank you! Your feedback has been submitted to the MCC event organizers.');
    }, 600);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <MessageSquare className="w-7 h-7 text-[#00A4EF]" /> Event Feedback & Surveys (§49)
        </h1>
        <p className="text-sm text-slate-600 dark:text-[#A8B0BB] mt-1">
          Share your experience for attended MCC workshops & hackathons to earn community feedback points.
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
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-[#F5F7FA] block mb-1">Select Attended Event *</label>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full p-2.5 text-xs bg-white dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A4EF] focus:outline-none"
              >
                {INITIAL_EVENTS.map((evt) => (
                  <option key={evt.eventId} value={evt.eventId}>
                    {evt.title} ({evt.category})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-[#F5F7FA] block mb-2">Event Rating (1 to 5 Stars)</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 text-[#FFB900] hover:scale-110 transition-transform"
                  >
                    <Star className={`w-6 h-6 ${star <= rating ? 'fill-[#FFB900]' : 'text-slate-300 dark:text-slate-700'}`} />
                  </button>
                ))}
                <span className="text-xs font-bold text-slate-700 dark:text-[#F5F7FA] ml-2">{rating} / 5 Stars</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-[#F5F7FA] block mb-1">Detailed Review / Suggestions *</label>
              <textarea
                rows={4}
                required
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="What did you enjoy most? How can we make future workshops even better?"
                className="w-full p-3 text-xs bg-white dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A4EF] focus:outline-none"
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" variant="fluent" size="lg" disabled={isSubmitting}>
                <Send className="w-4 h-4" /> {isSubmitting ? 'Submitting Feedback...' : 'Submit Feedback'}
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
