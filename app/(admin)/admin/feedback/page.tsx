'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { MessageSquare, Star, Trash2 } from 'lucide-react';

const MOCK_FEEDBACK = [
  {
    id: 'f1',
    studentName: 'Rahul Sharma',
    eventName: 'Azure Cloud Architecture Masterclass',
    rating: 5,
    comment: 'Exceptional hands-on session on serverless Azure Functions and Cosmos DB!',
    date: 'Aug 25, 2026'
  },
  {
    id: 'f2',
    studentName: 'Ananya Verma',
    eventName: 'National Azure AI Hackathon 2026',
    rating: 5,
    comment: 'The mentor guidance and Azure OpenAI API credits were invaluable for our team.',
    date: 'Aug 20, 2026'
  }
];

export default function AdminFeedbackPage() {
  const [feedbackList, setFeedbackList] = useState(MOCK_FEEDBACK);

  const handleDelete = (id: string) => {
    setFeedbackList((prev) => prev.filter((item) => item.id !== id));
    toast.success('Feedback entry archived.');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-7 h-7 text-[#00A4EF]" /> Feedback Manager
          </h1>
          <p className="text-sm text-slate-600 dark:text-[#A8B0BB] mt-1">
            Review student feedback ratings and suggestions across MCC events.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {feedbackList.map((f) => (
          <Card key={f.id} className="p-6 space-y-3 border-slate-200 dark:border-[#2A323D]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{f.eventName}</h3>
                <p className="text-xs text-slate-500 dark:text-[#A8B0BB]">By {f.studentName} • {f.date}</p>
              </div>

              <div className="flex items-center gap-1 text-[#FFB900]">
                {[...Array(f.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#FFB900]" />
                ))}
              </div>
            </div>

            <p className="text-xs text-slate-700 dark:text-[#F5F7FA] italic bg-slate-50 dark:bg-[#0B0F14] p-3 rounded-xl border border-slate-200 dark:border-[#2A323D]">
              &quot;{f.comment}&quot;
            </p>

            <div className="flex justify-end pt-1">
              <Button variant="outline" size="sm" onClick={() => handleDelete(f.id)} className="text-[#F25022] hover:border-[#F25022]">
                <Trash2 className="w-3.5 h-3.5" /> Archive Feedback
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
