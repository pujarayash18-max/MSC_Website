import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, User } from 'lucide-react';
import type { BlogPost } from '@prisma/client';

interface BlogPageProps {
  params: Promise<{ slug: string }>;
}

async function getBlogPost(id: string): Promise<BlogPost | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/blogs/${encodeURIComponent(id)}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data?.blog || null;
  } catch {
    return null;
  }
}

export default async function BlogDetailPage({ params }: BlogPageProps) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const blog = await getBlogPost(decodedSlug);

  if (!blog) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 py-8">
      <Link href="/blog">
        <Button variant="outline" size="sm">
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </Button>
      </Link>

      <Card className="p-8 space-y-6 border-slate-200 dark:border-[#2A323D]">
        <div className="space-y-4 border-b border-slate-200 dark:border-[#2A323D] pb-6">
          <Badge variant="primary">{blog.category}</Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            {blog.title}
          </h1>

          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1 text-slate-900 dark:text-white font-semibold">
              <User className="w-4 h-4 text-sky-400" /> {blog.authorName} ({blog.authorRole})
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-slate-500" /> {new Date(blog.publishedAt).toLocaleDateString()}
            </span>
            <span>•</span>
            <span>{blog.readTime}</span>
          </div>
        </div>

        {blog.banner && (
          <div className="relative h-72 sm:h-96 w-full rounded-2xl overflow-hidden shadow-lg bg-slate-900">
            <Image
              src={blog.banner}
              alt={blog.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed space-y-4 text-sm sm:text-base">
          {blog.content.split('\n\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        {blog.tags && blog.tags.length > 0 && (
          <div className="pt-6 border-t border-slate-200 dark:border-[#2A323D] flex flex-wrap gap-2">
            {blog.tags.map((tag) => (
              <span key={tag} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded-lg">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
