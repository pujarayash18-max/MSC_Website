'use client';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { FileText, Plus, Edit3 } from 'lucide-react';

const MOCK_ADMIN_BLOGS = [
  { id: 'b1', title: 'Building Serverless REST APIs with Azure Functions v4 & TypeScript', category: 'Cloud', status: 'Published', date: 'Aug 20, 2026' },
  { id: 'b2', title: 'Optimizing Cosmos DB NoSQL Queries & Indexing Strategies', category: 'Databases', status: 'Published', date: 'Aug 14, 2026' },
  { id: 'b3', title: 'Getting Started with GitHub Copilot Enterprise in 2026', category: 'DevOps', status: 'Draft', date: 'Aug 24, 2026' }
];

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState(MOCK_ADMIN_BLOGS);

  const togglePublish = (id: string) => {
    setBlogs((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: b.status === 'Published' ? 'Draft' : 'Published' } : b))
    );
    toast.success('Blog publication state toggled!');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <FileText className="w-7 h-7 text-sky-400" /> Technical Blog Manager
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Create Markdown technical posts, manage tags, drafts, and scheduled publishing.
          </p>
        </div>

        <Button variant="fluent" size="sm" onClick={() => toast.success('New blog post draft initialized!')}>
          <Plus className="w-4 h-4" /> Create New Post
        </Button>
      </div>

      <div className="space-y-3">
        {blogs.map((b) => (
          <Card key={b.id} className="p-5 border-slate-800 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant={b.status === 'Published' ? 'success' : 'warning'}>{b.status}</Badge>
                <Badge variant="primary" size="sm">{b.category}</Badge>
              </div>
              <h3 className="text-base font-bold text-white">{b.title}</h3>
              <p className="text-xs text-slate-400">Date: {b.date}</p>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => togglePublish(b.id)}>
                {b.status === 'Published' ? 'Unpublish' : 'Publish Post'}
              </Button>
              <Button variant="fluent" size="sm" onClick={() => toast.success(`Blog editor opened for "${b.title}"`)}>
                <Edit3 className="w-3.5 h-3.5" /> Edit
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
