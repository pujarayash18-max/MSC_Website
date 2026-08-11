'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, User, ArrowRight, Sparkles, BookOpen } from 'lucide-react';
import { dynamicDb, BlogPost } from '@/lib/services/dataService';

export default function BlogListPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'leadership'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    const all = dynamicDb.getBlogs();
    const published = all.filter((b) => b.status === 'Published' || !b.status);
    setBlogs(published);
  }, []);

  const categories = ['All', ...Array.from(new Set(blogs.map((b) => b.category)))];

  const displayedBlogs = blogs.filter((b) => {
    if (activeTab === 'leadership' && !b.isLeadership) return false;
    if (selectedCategory !== 'All' && b.category !== selectedCategory) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 py-8">
      <div className="text-center space-y-3">
        <Badge variant="primary">Technical Articles & Campus Insights</Badge>
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">Engineering & Community Blogs</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Articles, tutorials, and cloud architecture deep dives written by MCC leads, core team members, and student developers.
        </p>

        {/* Section Tabs: Community Blogs vs Core Team Leadership Insights */}
        <div className="pt-4 flex flex-wrap justify-center gap-3">
          <Button
            variant={activeTab === 'all' ? 'fluent' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('all')}
            className="rounded-xl px-5"
          >
            <BookOpen className="w-4 h-4 mr-1.5" /> All Community Blogs
          </Button>
          <Button
            variant={activeTab === 'leadership' ? 'fluent' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('leadership')}
            className="rounded-xl px-5 border-purple-500/40 text-purple-600 dark:text-purple-400"
          >
            <Sparkles className="w-4 h-4 mr-1.5 text-purple-400" /> Leadership Insights (Core Team)
          </Button>
        </div>

        {/* Category Pill Filters */}
        <div className="flex flex-wrap justify-center gap-2 pt-2 text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg border font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-[#00A4EF] text-white border-[#00A4EF]'
                  : 'bg-slate-100 dark:bg-[#151B23] text-slate-600 dark:text-[#A8B0BB] border-slate-200 dark:border-[#2A323D]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {displayedBlogs.length === 0 ? (
        <Card className="p-12 text-center border-slate-200 dark:border-slate-800">
          <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Published Posts Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Check back soon for new community articles!</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {displayedBlogs.map((blog) => (
            <Card key={blog.id} className="overflow-hidden border-slate-200 dark:border-slate-800 flex flex-col group hover:border-sky-500/50 transition-all">
              <div className="h-48 overflow-hidden relative">
                <Image
                  src={blog.banner || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80'}
                  alt={blog.title}
                  width={400}
                  height={200}
                  unoptimized
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  <Badge variant="primary" className="font-bold">{blog.category}</Badge>
                  {blog.isLeadership && <Badge variant="purple" className="font-bold">Leadership Insight</Badge>}
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">{blog.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{blog.excerpt}</p>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-slate-900 dark:text-white font-medium">
                      <User className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" /> {blog.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> {blog.readTime || '5 min read'}
                    </span>
                  </div>

                  <Link href={`/blog/${blog.slug}`}>
                    <Button variant="ghost" size="sm" className="text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-white">
                      Read Article <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
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
