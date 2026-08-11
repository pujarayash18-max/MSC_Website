'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, User, ArrowRight, PenSquare, Sparkles } from 'lucide-react';
import { dynamicDb } from '@/lib/services/dataService';
import { Blog } from '@/types/content';
import { useAuth } from '@/hooks/useAuth';

export default function BlogListPage() {
  const { isAuthenticated } = useAuth();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [filter, setFilter] = useState<'All' | 'CoreTeam' | 'Community'>('All');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
      const all = dynamicDb.getBlogs() as Blog[];
      // Public blog MUST ONLY render Published blogs
      const published = all.filter((b) => b.status === 'Published');
      setBlogs(published);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return null;

  const filteredBlogs = blogs.filter((b) => {
    if (filter === 'CoreTeam') return b.authorType === 'CoreTeam';
    if (filter === 'Community') return b.authorType === 'Community';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 py-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-slate-100 dark:bg-[#151B23] p-8 rounded-3xl border border-slate-200 dark:border-[#2A323D] shadow-xl">
        <div className="space-y-2 text-center md:text-left">
          <Badge variant="primary" className="mb-1">Technical Articles & Tutorials</Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">Engineering & Cloud Insights</h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-[#A8B0BB] max-w-xl">
            Articles, tutorials, and cloud architecture deep dives written by Microsoft Student Ambassadors, Core Team leads, and community members.
          </p>
        </div>

        {isAuthenticated && (
          <Link href="/dashboard/blogs/new">
            <Button variant="fluent" size="lg" className="font-bold gap-2 shadow-lg shrink-0">
              <PenSquare className="w-4 h-4" /> Write a Community Article
            </Button>
          </Link>
        )}
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-[#2A323D] pb-4">
        <Button
          variant={filter === 'All' ? 'fluent' : 'ghost'}
          size="sm"
          onClick={() => setFilter('All')}
          className="text-xs font-bold"
        >
          All Published ({blogs.length})
        </Button>

        <Button
          variant={filter === 'CoreTeam' ? 'fluent' : 'ghost'}
          size="sm"
          onClick={() => setFilter('CoreTeam')}
          className="text-xs font-bold gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" /> From the Core Team ({blogs.filter((b) => b.authorType === 'CoreTeam').length})
        </Button>

        <Button
          variant={filter === 'Community' ? 'fluent' : 'ghost'}
          size="sm"
          onClick={() => setFilter('Community')}
          className="text-xs font-bold gap-1.5"
        >
          <User className="w-3.5 h-3.5 text-sky-400" /> Community Authors ({blogs.filter((b) => b.authorType === 'Community').length})
        </Button>
      </div>

      {filteredBlogs.length === 0 ? (
        <Card className="p-12 text-center text-slate-500 dark:text-slate-400 text-xs border-slate-200 dark:border-[#2A323D]">
          No published articles found under &quot;{filter}&quot;.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredBlogs.map((blog) => (
            <Card key={blog.blogId || blog.slug} className="overflow-hidden border-slate-200 dark:border-[#2A323D] flex flex-col group hover:border-sky-500/50 transition-all">
              <div className="h-48 overflow-hidden relative">
                <Image src={blog.banner || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80'} alt={blog.title} width={400} height={200} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <Badge variant="primary" className="font-bold">{blog.category}</Badge>
                  {blog.authorType === 'CoreTeam' ? (
                    <Badge variant="warning" className="font-extrabold flex items-center gap-1 shadow-md">
                      <Sparkles className="w-3 h-3" /> Core Team
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="font-bold">Community Author</Badge>
                  )}
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">{blog.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-[#A8B0BB] leading-relaxed line-clamp-3">
                    {blog.content.replace(/[#*`_]/g, '').slice(0, 160)}...
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-[#2A323D] flex items-center justify-between text-xs text-slate-600 dark:text-[#A8B0BB]">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 font-semibold text-slate-900 dark:text-white">
                      <User className="w-3.5 h-3.5 text-[#00A4EF]" /> {blog.authorName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#7FBA00]" /> {blog.readingTime || blog.readTime || '5 min read'}
                    </span>
                  </div>

                  <Link href={`/blog/${blog.slug}`} className="text-[#0078D4] dark:text-[#00A4EF] font-bold hover:underline flex items-center gap-1">
                    Read Article <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
