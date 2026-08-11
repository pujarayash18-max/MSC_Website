'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { dynamicDb } from '@/lib/services/dataService';
import { Blog, BlogStatus } from '@/types/content';
import { FileText, Plus, AlertCircle, CheckCircle2, Clock, RotateCcw } from 'lucide-react';

export default function MyBlogSubmissionsPage() {
  const { user } = useAuth();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
      const allBlogs = dynamicDb.getBlogs() as Blog[];
      const myBlogs = user
        ? allBlogs.filter((b) => b.authorId === user.userId || b.authorId === user.id || b.authorName === user.fullName)
        : allBlogs;
      setBlogs(myBlogs);
    }, 0);
    return () => clearTimeout(timer);
  }, [user]);

  if (!mounted) return null;

  const getStatusBadge = (status: BlogStatus) => {
    switch (status) {
      case 'Published':
        return <Badge variant="success" className="gap-1"><CheckCircle2 className="w-3 h-3" /> Published</Badge>;
      case 'Pending':
        return <Badge variant="warning" className="gap-1"><Clock className="w-3 h-3" /> Pending Review</Badge>;
      case 'Rejected':
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

      {blogs.length === 0 ? (
        <Card className="p-12 text-center space-y-4 border-slate-200 dark:border-[#2A323D]">
          <div className="w-16 h-16 rounded-full bg-sky-500/10 text-[#00A4EF] flex items-center justify-center mx-auto">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Blog Submissions Yet</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Share your knowledge on Azure, Web Development, GenAI, or Open-Source to get published on the official Microsoft Student Community technical blog!
          </p>
          <Link href="/dashboard/blogs/new">
            <Button variant="fluent" size="md" className="font-bold gap-2">
              <Plus className="w-4 h-4" /> Submit Your First Article
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {blogs.map((blog) => (
            <Card key={blog.blogId || blog.slug} className="p-6 space-y-4 border-slate-200 dark:border-[#2A323D]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(blog.status || 'Pending')}
                    <span className="text-xs text-slate-500 dark:text-slate-400">• {blog.category}</span>
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">{blog.title}</h3>
                </div>

                {blog.status === 'Rejected' && (
                  <Link href={`/dashboard/blogs/new?edit=${encodeURIComponent(blog.slug)}`}>
                    <Button variant="outline" size="sm" className="font-bold gap-2 border-rose-500/40 text-rose-500 hover:bg-rose-500/10">
                      <RotateCcw className="w-3.5 h-3.5" /> Edit & Resubmit
                    </Button>
                  </Link>
                )}
              </div>

              {blog.status === 'Rejected' && blog.rejectionNote && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-600 dark:text-rose-400 space-y-1">
                  <span className="font-extrabold block">Executive Board Rejection Feedback:</span>
                  <p>{blog.rejectionNote}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-[#2A323D] text-xs text-slate-500 dark:text-[#A8B0BB]">
                <span>Submitted: {new Date(blog.publishedAt || blog.createdAt || '2026-08-01T00:00:00.000Z').toLocaleDateString()}</span>
                {blog.status === 'Published' && (
                  <Link href={`/blog/${blog.slug}`} className="text-[#00A4EF] font-bold hover:underline">
                    View Published Post →
                  </Link>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
