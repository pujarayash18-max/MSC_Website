import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { INITIAL_BLOGS } from '@/lib/services/dataService';
import { ArrowLeft, Clock, User } from 'lucide-react';

interface BlogPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return INITIAL_BLOGS.map((b) => ({
    slug: b.slug,
  }));
}

export default async function BlogDetailPage({ params }: BlogPageProps) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const blog = INITIAL_BLOGS.find(
    (b) => b.slug === slug || b.slug === decodedSlug || b.id === slug
  );

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

      <Card className="p-8 space-y-6 border-slate-800">
        <div className="space-y-4 border-b border-slate-800 pb-6">
          <Badge variant="primary">{blog.category}</Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            {blog.title}
          </h1>

          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1 text-white font-semibold">
              <User className="w-4 h-4 text-sky-400" /> {blog.author} ({blog.authorRole})
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-slate-500" /> {blog.publishedDate}
            </span>
            <span>•</span>
            <span>{blog.readTime}</span>
          </div>
        </div>

        <Image
          src={blog.banner}
          alt={blog.title}
          width={800}
          height={320}
          className="w-full h-80 object-cover rounded-2xl border border-slate-800"
        />

        <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed space-y-4">
          <p className="text-base font-medium text-slate-200">{blog.excerpt}</p>
          <div className="whitespace-pre-line leading-relaxed">{blog.content}</div>
        </div>
      </Card>
    </div>
  );
}
