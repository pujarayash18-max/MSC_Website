'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { FileText, Plus, AlertCircle, CheckCircle2, Clock, RotateCcw, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import type { BlogPost } from '@prisma/client';

async function fetchMyBlogs(): Promise<BlogPost[]> {
  const res = await fetch('/api/blogs', { credentials: 'include' });
  if (!res.ok) return [];
  const json = await res.json();
  return json.data?.blogs || [];
}

export default function MyBlogSubmissionsPage() {
  const { user } = useAuth();
  const { data: allBlogs = [], isLoading } = useQuery({
    queryKey: ['my-blogs'],
    queryFn: fetchMyBlogs,
  });

  const myBlogs = user
    ? allBlogs.filter((b) => b.authorId === user.id || b.authorName === user.fullName)
    : allBlogs;

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'published':
        return <Badge variant="success" className="gap-1"><CheckCircle2 className="w-3 h-3" /> Published</Badge>;
      case 'pending':
        return <Badge variant="warning" className="gap-1"><Clock className="w-3 h-3" /> Pending Review</Badge>;
      case 'rejected':
        return <Badge variant="danger" className="gap-1"><AlertCircle className="w-3 h-3" /> Rejected</Badge>;
      default:
        return <Badge variant="outline">Draft</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-7 h-7 text-[#00A4EF]" /> My Blog Submissions
          </h1>
          <p className="text-sm text-slate-600 dark:text-[#A8B0BB] mt-1">
            Write technical articles, share bootcamp tutorials, and track your review status with the Executive Board.
          </p>
        </div>

        <Link href="/dashboard/blogs/new">
          <Button variant="fluent" size="sm" className="font-bold gap-2">
            <Plus className="w-4 h-4" /> Write New Article
          </Button>
        </Link>
      </div>

      <Card className="p-6 space-y-4 border-slate-200 dark:border-[#2A323D]">
        <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-[#2A323D] pb-3">
          Submitted Articles ({myBlogs.length})
        </h2>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#00A4EF]" />
          </div>
        ) : myBlogs.length === 0 ? (
          <div className="text-center py-12 text-slate-500 space-y-3">
            <p>You have not submitted any blog articles yet.</p>
            <Link href="/dashboard/blogs/new">
              <Button variant="fluent" size="sm">Create First Article</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {myBlogs.map((blog) => (
              <div
                key={blog.id}
                className="p-4 rounded-xl bg-slate-50 dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(blog.status)}
                    <span className="text-xs text-slate-500 font-medium">{blog.category}</span>
                  </div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">{blog.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-[#A8B0BB] line-clamp-1">{blog.excerpt}</p>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  <Link href={`/dashboard/blogs/new?edit=${blog.slug || blog.id}`}>
                    <Button variant="outline" size="sm">
                      <RotateCcw className="w-3.5 h-3.5" /> Edit / Resubmit
                    </Button>
                  </Link>
                  <Link href={`/blog/${blog.slug || blog.id}`}>
                    <Button variant="ghost" size="sm">Preview</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
