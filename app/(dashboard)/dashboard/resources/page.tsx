'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useRealtime, RealtimeEvent } from '@/hooks/useRealtime';
import { toast } from 'sonner';
import { FolderDown, Download, Lock, Sparkles, LogIn, ShieldCheck, UserPlus, Ticket, CheckCircle2, Globe } from 'lucide-react';
import { MicrosoftFourSquareIcon } from '@/components/icons';

// Mock registered events for current user
const MOCK_USER_REGISTRATIONS = ['evt_01', 'evt_02']; // Azure Masterclass & AI Challenge
const MOCK_USER_CHECKINS = ['evt_01']; // Checked in for Azure Masterclass

const INITIAL_STUDENT_RESOURCES = [
  {
    resourceId: 'res_01',
    eventId: 'evt_01',
    eventTitle: 'Azure Cloud Architecture & Serverless Masterclass',
    title: 'Azure Functions v4 Node.js Starter Kit',
    category: 'Source Code',
    visibility: 'Checked-in Students Only',
    blobUrl: 'https://github.com/mcc-marwadi/azure-functions-starter',
    uploadedAt: '2026-08-25 10:15 AM'
  },
  {
    resourceId: 'res_02',
    eventId: 'evt_01',
    eventTitle: 'Azure Cloud Architecture & Serverless Masterclass',
    title: 'Cosmos DB NoSQL Modeling Slides PDF',
    category: 'Slides',
    visibility: 'Registered Students',
    blobUrl: 'https://mccdevstorage.blob.core.windows.net/resources/cosmos-slides.pdf',
    uploadedAt: '2026-08-25 09:30 AM'
  },
  {
    resourceId: 'res_03',
    eventId: 'evt_03',
    eventTitle: 'Full-Stack Web Development Starter Bootcamp',
    title: 'Full-Stack Next.js 15 & Tailwind CSS Starter Kit',
    category: 'Source Code',
    visibility: 'Registered Students',
    blobUrl: 'https://github.com/mcc-marwadi/nextjs-fluent-starter',
    uploadedAt: '2026-08-24 02:00 PM'
  }
];

export default function StudentResourcesPage() {
  const router = useRouter();
  const { user, isAuthenticated, login, isLoading } = useAuth();
  const [resources, setResources] = useState(INITIAL_STUDENT_RESOURCES);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/dashboard/resources');
    }
  }, [isLoading, isAuthenticated, router]);

  // Real-time listener for live resource uploads during event (§48, §123)
  useRealtime('LIVE_RESOURCE_UPLOADED', (event: RealtimeEvent<any>) => {
    toast.success(`⚡ Live Resource Broadcast Received: "${event.payload.title}"`, {
      description: `Target Event: ${event.payload.eventTitle || 'Event Workshop'}`
    });
    setResources((prev) => [
      {
        resourceId: `res_${Date.now()}`,
        eventId: event.payload.eventId || 'evt_01',
        eventTitle: event.payload.eventTitle || 'Azure Masterclass',
        title: event.payload.title,
        category: event.payload.category,
        visibility: event.payload.visibility,
        blobUrl: event.payload.blobUrl,
        uploadedAt: 'Just Now'
      },
      ...prev
    ]);
  });

  if (!isAuthenticated) {
    return (
      <Card className="p-8 max-w-2xl mx-auto my-12 bg-gradient-to-r from-[#0078D4]/10 via-[#00A4EF]/15 to-purple-600/10 border-[#00A4EF]/40 dark:border-[#00A4EF]/30 shadow-2xl relative overflow-hidden text-center space-y-6">
        <div className="w-14 h-14 rounded-2xl bg-[#0078D4] dark:bg-[#00A4EF] flex items-center justify-center text-white mx-auto shadow-lg shadow-sky-500/30">
          <Lock className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <Badge variant="warning" className="gap-1 font-bold">
            <ShieldCheck className="w-3.5 h-3.5" /> Authentication Required
          </Badge>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Please Sign In to Access Event Resources
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-[#A8B0BB] leading-relaxed max-w-md mx-auto">
            Student event resources, live SignalR code broadcasts, and checked-in starter kits are restricted to registered event members. Please sign in to continue.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link href="/login?redirect=/dashboard/resources">
            <Button variant="fluent" size="lg" className="gap-2 px-6 shadow-xl shadow-sky-500/25">
              <LogIn className="w-4 h-4" /> Sign In to Access
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="secondary" size="lg" className="gap-2 px-6">
              <UserPlus className="w-4 h-4 text-[#00A4EF]" /> Register Account
            </Button>
          </Link>
          <Button variant="outline" size="lg" onClick={() => login('aad')} className="gap-2 px-6">
            <MicrosoftFourSquareIcon className="w-4 h-4" /> Microsoft SSO
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <FolderDown className="w-7 h-7 text-[#00A4EF]" /> Event Learning Resources
          </h1>
          <p className="text-sm text-slate-600 dark:text-[#A8B0BB] mt-1">
            Access slides, practice datasets, live coding starter kits, and recordings for your registered events.
          </p>
        </div>

        <Badge variant="success" className="gap-1 animate-pulse w-fit">
          <Sparkles className="w-3.5 h-3.5" /> SignalR Live Sync Active
        </Badge>
      </div>

      <div className="space-y-4">
        {resources.map((res) => {
          const isRegistered = res.eventId === 'evt_general' || MOCK_USER_REGISTRATIONS.includes(res.eventId);
          const isCheckedIn = res.eventId === 'evt_general' || MOCK_USER_CHECKINS.includes(res.eventId);

          let hasPermission = false;
          if (res.visibility === 'Public') hasPermission = true;
          else if (res.visibility === 'Registered Students' && isRegistered) hasPermission = true;
          else if (res.visibility === 'Checked-in Students Only' && isCheckedIn) hasPermission = true;

          return (
            <Card key={res.resourceId} className="p-6 border-slate-200 dark:border-[#2A323D] hover:border-[#00A4EF]/50 transition-all">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="primary" size="sm">{res.category}</Badge>

                    {/* Access Control Badges */}
                    {res.visibility === 'Registered Students' && (
                      <Badge variant={isRegistered ? 'success' : 'purple'} size="sm" className="gap-1">
                        <Ticket className="w-3 h-3" /> {isRegistered ? 'Registered Member Access' : 'Registered Members Only'}
                      </Badge>
                    )}
                    {res.visibility === 'Checked-in Students Only' && (
                      <Badge variant={isCheckedIn ? 'success' : 'purple'} size="sm" className="gap-1">
                        <Lock className="w-3 h-3" /> {isCheckedIn ? 'Checked-In Access' : 'Checked-in Students Only'}
                      </Badge>
                    )}
                    {res.visibility === 'Public' && (
                      <Badge variant="outline" size="sm" className="gap-1">
                        <Globe className="w-3 h-3" /> All Signed-in Users
                      </Badge>
                    )}

                    <span className="text-[11px] text-slate-500 dark:text-[#A8B0BB]">{res.uploadedAt}</span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{res.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-[#A8B0BB]">{res.eventTitle}</p>
                </div>

                <div>
                  {hasPermission ? (
                    <a href={res.blobUrl} target="_blank" rel="noreferrer">
                      <Button variant="fluent" size="sm">
                        <Download className="w-4 h-4" /> Access Resource
                      </Button>
                    </a>
                  ) : !isRegistered ? (
                    <Link href="/events">
                      <Button variant="secondary" size="sm" className="gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                        <Ticket className="w-3.5 h-3.5" /> Register for Event
                      </Button>
                    </Link>
                  ) : (
                    <Button variant="outline" size="sm" disabled className="gap-1.5 text-xs">
                      <Lock className="w-3.5 h-3.5" /> Venue Check-in Required
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
