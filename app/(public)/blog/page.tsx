'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, User, ArrowRight, PenSquare, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import type { BlogPost } from '@prisma/client';

async function fetchBlogs(): Promise<BlogPost[]> {
  const res = await fetch('/api/blogs');
  if (!res.ok) return [];
  const json = await res.json();
  return json.data?.blogs || [];
}

export default function BlogListPage() {
  const { isAuthenticated } = useAuth();
  const [filter, setFilter] = useState<'All' | 'CoreTeam' | 'Community'>('All');

  const { data: blogs = [], isLoading } = useQuery({
    queryKey: ['blogs'],
    queryFn: fetchBlogs,
  });

  const filteredBlogs = blogs.filter((b) => {
    if (filter === 'CoreTeam') return b.authorRole?.includes('Lead') || b.authorRole?.includes('Admin');
    if (filter === 'Community') return !b.authorRole?.includes('Lead') && !b.authorRole?.includes('Admin');
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 py-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-slate-100 dark:bg-[#151B23] p-8 rounded-3xl border border-slate-200 dark:border-[#2A323D] shadow-xl">
        <div className="space-y-2 text-center md:text-left">
          <Badge variant="primary" className="mb-1">Technical Articles &amp; Tutorials</Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">Engineering &amp; Cloud Insights</h1>
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
        {(['All', 'CoreTeam', 'Community'] as const).map((type) => (
          <Button
            key={type}
            variant={filter === type ? 'fluent' : 'outline'}
            size="sm"
            onClick={() => setFilter(type)}
            className="text-xs font-semibold"
          >
            {type === 'All' ? 'All Articles' : type === 'CoreTeam' ? 'Core Team' : 'Student Submissions'}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#00A4EF]" />
        </div>
      ) : filteredBlogs.length === 0 ? (
        <div className="text-center py-16 text-slate-500">No blog posts found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBlogs.map((post) => (
            <Card key={post.id} className="overflow-hidden flex flex-col hover:border-[#00A4EF] transition-all group border-slate-200 dark:border-[#2A323D]">
              <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                <Image
                  src={post.banner || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200'}
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <Badge variant="primary" className="absolute top-3 left-3 shadow-md">
                  {post.category}
                </Badge>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-[#00A4EF] transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-[#A8B0BB] line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-[#2A323D] flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-[#00A4EF]" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{post.authorName}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{post.readTime}</span>
                  </div>
                </div>

                <Link href={`/blog/${post.slug || post.id}`} className="block pt-1">
                  <Button variant="ghost" size="sm" className="w-full justify-between text-xs font-bold text-[#00A4EF]">
                    Read Full Article <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
