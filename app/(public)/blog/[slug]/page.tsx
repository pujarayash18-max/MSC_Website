'use client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, User, Share2 } from 'lucide-react';

export default function BlogDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 py-8">
      <Link href="/blog">
        <Button variant="outline" size="sm">
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </Button>
      </Link>

      <Card className="p-8 space-y-6 border-slate-800">
        <div className="space-y-4 border-b border-slate-800 pb-6">
          <Badge variant="primary">Cloud Architecture</Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            Building Serverless REST APIs with Azure Functions v4 & TypeScript
          </h1>

          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1 text-white font-semibold"><User className="w-4 h-4 text-sky-400" /> Rahul Sharma</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-slate-500" /> Aug 20, 2026</span>
            <span>•</span>
            <span>6 min read</span>
          </div>
        </div>

        <img
          src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80"
          alt="Blog Banner"
          className="w-full h-80 object-cover rounded-2xl border border-slate-800"
        />

        <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed space-y-4">
          <p>
            Azure Functions v4 programming model for Node.js and TypeScript introduces a streamlined, code-centric API for constructing serverless endpoints. In this guide, we examine how to structure enterprise-grade APIs for community management platforms.
          </p>

          <h3 className="text-xl font-bold text-white">1. Programming Model Architecture</h3>
          <p>
            With Azure Functions v4, endpoints are registered directly in code without needing separate <code>function.json</code> configuration files per HTTP trigger.
          </p>

          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-sky-300 overflow-x-auto">
{`import { app, HttpRequest, HttpResponseInit } from '@azure/functions';

export async function getEvents(request: HttpRequest): Promise<HttpResponseInit> {
  return { status: 200, jsonBody: { success: true, events: [] } };
}

app.http('events-get', {
  methods: ['GET'],
  route: 'events',
  handler: getEvents
});`}
          </pre>

          <h3 className="text-xl font-bold text-white">2. Cosmos DB NoSQL Partitioning</h3>
          <p>
            Selecting appropriate partition keys is critical for horizontal scaling. For event registrations, partitioning by <code>/eventId</code> ensures hot queries execute with single-partition latency.
          </p>
        </div>
      </Card>
    </div>
  );
}
