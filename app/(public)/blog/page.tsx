'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, User, ArrowRight } from 'lucide-react';

const MOCK_BLOGS = [
  {
    blogId: 'b1',
    slug: 'getting-started-with-azure-static-web-apps',
    title: 'Building Serverless REST APIs with Azure Functions v4 & TypeScript',
    excerpt: 'A comprehensive guide on writing serverless API endpoints using Node.js v4 programming model with Cosmos DB integration.',
    category: 'Cloud Architecture',
    author: 'Rahul Sharma',
    authorRole: 'Super Admin',
    publishedDate: 'Aug 20, 2026',
    readTime: '6 min read',
    banner: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80'
  },
  {
    blogId: 'b2',
    slug: 'building-genai-agents-with-openai-and-cosmosdb',
    title: 'Optimizing Cosmos DB NoSQL Queries & Indexing Strategies',
    excerpt: 'Learn how to tune indexing policies and optimize partition key strategies for high-throughput NoSQL database workloads.',
    category: 'Databases',
    author: 'Ananya Verma',
    authorRole: 'Website Admin',
    publishedDate: 'Aug 14, 2026',
    readTime: '8 min read',
    banner: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80'
  }
];

export default function BlogListPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 py-8">
      <div className="text-center space-y-3">
        <Badge variant="primary">Technical Articles & Tutorials</Badge>
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">Engineering & Cloud Insights</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">Articles, tutorials, and cloud architecture deep dives written by MCC leads and guest speakers.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {MOCK_BLOGS.map((blog) => (
          <Card key={blog.blogId} className="overflow-hidden border-slate-200 dark:border-slate-800 flex flex-col group hover:border-sky-500/50 transition-all">
            <div className="h-48 overflow-hidden relative">
              <Image src={blog.banner} alt={blog.title} width={400} height={200} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
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
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-400" /> {blog.readTime}</span>
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
