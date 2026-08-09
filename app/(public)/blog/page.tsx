'use client';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, User, ArrowRight } from 'lucide-react';

const MOCK_BLOGS = [
  {
    blogId: 'blog_01',
    title: 'Building Serverless REST APIs with Azure Functions v4 & TypeScript',
    slug: 'building-serverless-rest-apis-azure-functions-typescript',
    banner: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1000&auto=format&fit=crop&q=80',
    excerpt: 'Learn how to construct clean, scalable, serverless microservices using Node.js TypeScript and Azure Cosmos DB.',
    author: 'Rahul Sharma',
    readingTime: '6 min read',
    publishedAt: 'Aug 20, 2026',
    category: 'Cloud Architecture',
    tags: ['Azure', 'TypeScript', 'Serverless']
  },
  {
    blogId: 'blog_02',
    title: 'Optimizing Cosmos DB NoSQL Queries & Indexing Strategies',
    slug: 'optimizing-cosmos-db-nosql-queries-indexing',
    banner: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=1000&auto=format&fit=crop&q=80',
    excerpt: 'Deep dive into partition keys, indexing policies, and request unit (RU) cost optimization in Azure Cosmos DB.',
    author: 'Priya Mehta',
    readingTime: '8 min read',
    publishedAt: 'Aug 14, 2026',
    category: 'Databases',
    tags: ['CosmosDB', 'NoSQL', 'Performance']
  }
];

export default function BlogListPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 py-8">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <Badge variant="primary">MCC Technical Blog</Badge>
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">Engineering & Cloud Insights</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">Articles, tutorials, and cloud architecture deep dives written by MCC leads and guest speakers.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {MOCK_BLOGS.map((blog) => (
          <Card key={blog.blogId} className="overflow-hidden border-slate-200 dark:border-slate-800 flex flex-col group hover:border-sky-500/50 transition-all">
            <div className="h-48 overflow-hidden relative">
              <img src={blog.banner} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <Badge variant="primary" className="absolute top-3 left-3 font-bold">{blog.category}</Badge>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">{blog.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{blog.excerpt}</p>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-slate-900 dark:text-white font-medium"><User className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" /> {blog.author}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-400" /> {blog.readingTime}</span>
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
    </div>
  );
}
