'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { FileText, ArrowLeft, Send, Image as ImageIcon, Loader2 } from 'lucide-react';
import type { BlogPost } from '@prisma/client';

function BlogFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editSlug = searchParams?.get('edit') || '';

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Cloud Architecture');
  const [tagsInput, setTagsInput] = useState('Azure, Next.js, WebDev');
  const [banner, setBanner] = useState('https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);

  useEffect(() => {
    if (editSlug) {
      fetch(`/api/blogs/${encodeURIComponent(editSlug)}`)
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data?.blog) {
            const found: BlogPost = json.data.blog;
            setEditingBlog(found);
            setTitle(found.title);
            setCategory(found.category || 'Cloud Architecture');
            setTagsInput(found.tags ? found.tags.join(', ') : '');
            setBanner(found.banner || '');
            setContent(found.content || '');
          }
        })
        .catch(() => {});
    }
  }, [editSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error('Please enter article title and content.');
      return;
    }

    setIsSubmitting(true);

    const generatedSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);

    try {
      const isEditing = !!editingBlog;
      const url = isEditing ? `/api/blogs/${editingBlog.id}` : '/api/blogs';
      const method = isEditing ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: title.trim(),
          slug: generatedSlug,
          excerpt: content.slice(0, 160).trim() + '...',
          content: content.trim(),
          banner: banner || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200',
          category,
          tags,
          readTime: `${Math.max(1, Math.ceil(content.split(' ').length / 200))} min read`,
          status: 'pending',
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        toast.success(
          isEditing
            ? 'Article updated and resubmitted for review!'
            : 'Article submitted successfully! Pending Executive Board approval.'
        );
        router.push('/dashboard/blogs');
      } else {
        toast.error(json.error || 'Submission failed.');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-7 h-7 text-[#00A4EF]" />
            {editingBlog ? 'Edit & Resubmit Article' : 'Write Community Technical Article'}
          </h1>
          <p className="text-sm text-slate-600 dark:text-[#A8B0BB] mt-1">
            Submit your tutorial, Azure project case study, or developer experience article for community publication.
          </p>
        </div>

        <Link href="/dashboard/blogs">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4" /> Cancel
          </Button>
        </Link>
      </div>

      <Card className="p-6 sm:p-8 space-y-6 border-slate-200 dark:border-[#2A323D]">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Article Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Building Resilient Microservices with Azure Functions & Next.js"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 text-sm bg-slate-50 dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A4EF] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3 text-xs bg-slate-50 dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A4EF] focus:outline-none"
              >
                <option value="Cloud Architecture">Cloud Architecture</option>
                <option value="Artificial Intelligence">Artificial Intelligence</option>
                <option value="Full-Stack Engineering">Full-Stack Engineering</option>
                <option value="Student Experience">Student Experience</option>
                <option value="DevOps & CI/CD">DevOps &amp; CI/CD</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Tags (comma separated)</label>
              <input
                type="text"
                placeholder="Azure, Next.js, TypeScript"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full p-3 text-xs bg-slate-50 dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A4EF] focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <ImageIcon className="w-3.5 h-3.5 text-[#00A4EF]" /> Cover Banner Image URL
            </label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={banner}
              onChange={(e) => setBanner(e.target.value)}
              className="w-full p-3 text-xs bg-slate-50 dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A4EF] focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Article Markdown / Text Content *</label>
            <textarea
              required
              rows={12}
              placeholder="Write your article content here in Markdown format..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-4 text-xs font-mono bg-slate-50 dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A4EF] focus:outline-none leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-[#2A323D]">
            <Button
              type="submit"
              variant="fluent"
              size="lg"
              disabled={isSubmitting}
              className="font-bold gap-2"
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? 'Submitting Article...' : editingBlog ? 'Update & Resubmit' : 'Submit for Board Review'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default function NewBlogPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#00A4EF]" /></div>}>
      <BlogFormContent />
    </Suspense>
  );
}
