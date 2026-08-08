'use client';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRealtime, RealtimeEvent } from '@/hooks/useRealtime';
import { toast } from 'sonner';
import { FolderDown, Download, Lock, CheckCircle2, FileText, Code, Video, ExternalLink, Sparkles } from 'lucide-react';

const INITIAL_STUDENT_RESOURCES = [
  {
    resourceId: 'res_01',
    eventTitle: 'Azure Cloud Architecture & Serverless Masterclass',
    title: 'Azure Functions v4 Node.js Starter Kit',
    category: 'Source Code',
    visibility: 'Checked-in Students Only',
    blobUrl: 'https://github.com/mcc-marwadi/azure-functions-starter',
    uploadedAt: '2026-08-25 10:15 AM'
  },
  {
    resourceId: 'res_02',
    eventTitle: 'Azure Cloud Architecture & Serverless Masterclass',
    title: 'Cosmos DB NoSQL Modeling Slides PDF',
    category: 'Slides',
    visibility: 'Registered Students',
    blobUrl: 'https://mccdevstorage.blob.core.windows.net/resources/cosmos-slides.pdf',
    uploadedAt: '2026-08-25 09:30 AM'
  }
];

export default function StudentResourcesPage() {
  const [resources, setResources] = useState(INITIAL_STUDENT_RESOURCES);

  // Real-time listener for live resource uploads during event (§48, §123)
  useRealtime('LIVE_RESOURCE_UPLOADED', (event: RealtimeEvent<any>) => {
    toast.success(`⚡ Live Resource Broadcast Received: "${event.payload.title}"`, {
      description: 'Appeared instantly without refreshing!'
    });
    setResources((prev) => [
      {
        resourceId: `res_${Date.now()}`,
        eventTitle: 'Azure Cloud Architecture & Serverless Masterclass',
        title: event.payload.title,
        category: event.payload.category,
        visibility: event.payload.visibility,
        blobUrl: event.payload.blobUrl,
        uploadedAt: 'Just Now'
      },
      ...prev
    ]);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <FolderDown className="w-7 h-7 text-sky-400" /> Event Learning Resources (§48)
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Access slides, practice datasets, live coding starter kits, and recordings. Live updates push instantly during events.
          </p>
        </div>

        <Badge variant="success" className="gap-1 animate-pulse">
          <Sparkles className="w-3.5 h-3.5" /> SignalR Live Sync Active
        </Badge>
      </div>

      <div className="space-y-4">
        {resources.map((res) => (
          <Card key={res.resourceId} className="p-6 border-slate-800 hover:border-sky-500/40 transition-all">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Badge variant="primary" size="sm">{res.category}</Badge>
                  <Badge variant="purple" size="sm" className="gap-1">
                    <Lock className="w-3 h-3" /> {res.visibility}
                  </Badge>
                  <span className="text-[11px] text-slate-500">{res.uploadedAt}</span>
                </div>
                <h3 className="text-base font-bold text-white">{res.title}</h3>
                <p className="text-xs text-slate-400">{res.eventTitle}</p>
              </div>

              <a href={res.blobUrl} target="_blank" rel="noreferrer">
                <Button variant="fluent" size="sm">
                  <Download className="w-4 h-4" /> Access Resource
                </Button>
              </a>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
