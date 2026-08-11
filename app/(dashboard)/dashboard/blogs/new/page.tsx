'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { dynamicDb } from '@/lib/services/dataService';
import { Blog } from '@/types/content';
import { toast } from 'sonner';
import { FileText, ArrowLeft, Send, Image as ImageIcon } from 'lucide-react';

function BlogFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editSlug = searchParams?.get('edit') || '';

  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Cloud Architecture');
  const [tagsInput, setTagsInput] = useState('Azure, Next.js, WebDev');
  const [banner, setBanner] = useState('https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);

  useEffect(() => {
    if (editSlug) {
      const timer = setTimeout(() => {
        const allBlogs = dynamicDb.getBlogs() as Blog[];
        const found = allBlogs.find((b) => b.slug === editSlug);
        if (found) {
          setEditingBlog(found);
          setTitle(found.title);
          setCategory(found.category || 'Cloud Architecture');
          setTagsInput(found.tags ? found.tags.join(', ') : '');
          setBanner(found.banner || '');
          setContent(found.content || '');
        }
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [editSlug]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error('Please enter article title and content.');
      return;
    }

    setIsSubmitting(true);

    const generatedSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);

    const blogRecord: Blog = {
      id: editingBlog?.id || `blg_${Date.now()}`,
      blogId: editingBlog?.blogId || `blg_${Date.now()}`,
      title,
      slug: editingBlog?.slug || generatedSlug,
      banner,
      content,
      authorId: user?.userId || user?.id || 'usr_community',
      authorName: user?.fullName || 'Community Author',
      authorRole: user?.roleName || 'Student Member',
      authorPhoto: user?.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      category,
      tags,
      readingTime: `${Math.max(3, Math.ceil(content.split(' ').length / 150))} min read`,
      publishedAt: editingBlog?.publishedAt || new Date().toISOString(),
      status: 'Pending',
      authorType: 'Community',
      rejectionNote: undefined,
      isDeleted: false,
      createdAt: editingBlog?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    dynamicDb.saveBlog(blogRecord);
    setIsSubmitting(false);

    toast.success(editingBlog ? 'Article resubmitted for Executive Board review!' : 'Article submitted for Executive Board review!');
    router.push('/dashboard/blogs');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/blogs">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4" /> Back to My Articles
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#00A4EF]" />
            {editingBlog ? 'Edit & Resubmit Article' : 'Write & Submit Community Blog'}
          </h1>
          <p className="text-xs text-slate-600 dark:text-[#A8B0BB]">
            Submissions are reviewed by the Executive Board before publication on the public blog.
          </p>
        </div>
      </div>

      <Card className="p-6 sm:p-8 space-y-6 border-slate-200 dark:border-[#2A323D]">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Article Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Masteric Guide to Azure Functions & Next.js App Router"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 text-sm font-bold bg-white dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A4EF] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 text-xs bg-white dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A4EF] focus:outline-none"
              >
                <option value="Cloud Architecture">Cloud Architecture</option>
                <option value="Artificial Intelligence">Artificial Intelligence</option>
                <option value="Web Development">Web Development</option>
                <option value="DevOps & Open Source">DevOps & Open Source</option>
                <option value="Student Career & Growth">Student Career & Growth</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Tags (Comma-separated)</label>
              <input
                type="text"
                placeholder="Azure, Next.js, WebDev"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full p-2.5 text-xs bg-white dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A4EF] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <ImageIcon className="w-3.5 h-3.5 text-[#00A4EF]" /> Cover Banner Image URL
            </label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/photo-..."
              value={banner}
              onChange={(e) => setBanner(e.target.value)}
              className="w-full p-2.5 text-xs bg-white dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A4EF] focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Article Content (Markdown supported) *</label>
            <textarea
              required
              rows={12}
              placeholder="# Introduction&#10;&#10;Write your technical article body here using Markdown formatting..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-4 text-xs font-mono bg-white dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A4EF] focus:outline-none"
            />
          </div>

          <Button
            type="submit"
            variant="fluent"
            size="lg"
            disabled={isSubmitting}
            className="w-full justify-center font-bold gap-2"
          >
            <Send className="w-4 h-4" />
            {isSubmitting ? 'Submitting Article...' : editingBlog ? 'Resubmit Article for Review' : 'Submit Article for Review'}
          </Button>
        </form>
      </Card>
    </div>
  );
}

export default function NewBlogSubmissionPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading editor...</div>}>
      <BlogFormContent />
    </Suspense>
  );
}
