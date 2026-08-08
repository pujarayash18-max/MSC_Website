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
  const [speakerRating, setSpeakerRating] = useState(5);
  const [contentQuality, setContentQuality] = useState('Excellent');
  const [suggestions, setSuggestions] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    toast.success('Thank you! Your feedback has been recorded (§70).');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <MessageSquare className="w-7 h-7 text-sky-400" /> Event Feedback (§70)
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Share your experience for events you attended. Feedback is used to improve future Microsoft workshops.
        </p>
      </div>

      <Card className="p-8 border-slate-800 bg-slate-900/80 shadow-2xl">
        {isSubmitted ? (
          <div className="text-center py-8 space-y-4">
            <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto" />
            <h2 className="text-xl font-bold text-white">Feedback Submitted Successfully!</h2>
            <p className="text-xs text-slate-400">
              You earned <strong className="text-emerald-400">+5 Bonus Community Points</strong> for submitting event feedback.
            </p>
            <Button variant="outline" size="sm" onClick={() => setIsSubmitted(false)}>
              Submit Feedback for Another Event
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Select Attended Event</label>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full p-3 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
              >
                {INITIAL_EVENTS.map((evt) => (
                  <option key={evt.eventId} value={evt.eventId}>
                    {evt.title} ({evt.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Overall Rating */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">Overall Event Rating</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`p-2 rounded-xl border transition-all ${
                      star <= rating
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                        : 'bg-slate-950 border-slate-800 text-slate-600'
                    }`}
                  >
                    <Star className="w-5 h-5 fill-current" />
                  </button>
                ))}
                <span className="text-xs text-amber-400 font-bold ml-2">{rating} / 5 Stars</span>
              </div>
            </div>

            {/* Speaker Rating */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">Speaker & Content Quality</label>
              <div className="flex items-center gap-2">
                {['Good', 'Very Good', 'Excellent', 'Outstanding'].map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setContentQuality(q)}
                    className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-all ${
                      contentQuality === q
                        ? 'bg-sky-500/10 border-sky-500/40 text-sky-400'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Suggestions */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Comments & Future Suggestions</label>
              <textarea
                rows={4}
                placeholder="What did you like most? What topics would you like to see in future workshops?"
                value={suggestions}
                onChange={(e) => setSuggestions(e.target.value)}
                className="w-full p-3 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-sky-500 focus:outline-none placeholder-slate-500"
              />
            </div>

            <Button type="submit" variant="fluent" className="w-full justify-center text-xs py-3 font-bold">
              <Send className="w-4 h-4" /> Submit Verified Feedback (+5 Points)
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
