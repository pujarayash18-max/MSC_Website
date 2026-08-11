'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { FileText, Send, Clock, CheckCircle2, XCircle, RotateCcw, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { dynamicDb, BlogPost } from '@/lib/services/dataService';

export default function StudentDashboardBlogsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'submit' | 'history'>('submit');

  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [category, setCategory] = useState('Web & Cloud');
  const [tags, setTags] = useState('Next.js, Azure, WebDev');
  const [banner, setBanner] = useState('https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80');
  const [content, setContent] = useState('');
  const [isLeadership, setIsLeadership] = useState(false);

  const [myBlogs, setMyBlogs] = useState<BlogPost[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);

  const userRole = user?.roleName || 'Member';
  const canPublishLeadership =
    userRole.toLowerCase().includes('core') ||
    userRole.toLowerCase().includes('founding') ||
    userRole.toLowerCase().includes('president') ||
    userRole.toLowerCase().includes('executive') ||
    userRole.toLowerCase().includes('admin');

  const loadMyBlogs = () => {
    const allBlogs = dynamicDb.getBlogs();
    const userPosts = allBlogs.filter(
      (b) => b.authorUserId === user?.id || b.author === (user?.fullName || 'Rahul Sharma')
    );
    setMyBlogs(userPosts);
  };

  useEffect(() => {
    loadMyBlogs();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error('Please enter a valid title and blog content.');
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise((res) => setTimeout(res, 600));

      const isDirectPublish = canPublishLeadership && isLeadership;
      const blogId = editingBlogId || `blg_${Date.now()}`;
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      const newPost: BlogPost = {
        id: blogId,
        slug: slug || blogId,
        title: title.trim(),
        excerpt: excerpt.trim() || title.trim(),
        content: content.trim(),
        author: user?.fullName || 'Student Author',
        authorRole: user?.roleName || 'Community Member',
        authorPhoto: user?.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        publishedDate: new Date().toISOString().split('T')[0],
        readTime: `${Math.max(2, Math.ceil(content.split(' ').length / 150))} min read`,
        category,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        banner: banner.trim(),
        status: isDirectPublish ? 'Published' : 'Pending',
        isLeadership: isDirectPublish,
        authorUserId: user?.id
      };

      dynamicDb.saveBlog(newPost);
      loadMyBlogs();

      if (isDirectPublish) {
        toast.success('Leadership Blog published directly to the public portal!');
      } else if (editingBlogId) {
        toast.success('Revised blog resubmitted for Executive Board review!');
      } else {
        toast.success('Blog submitted successfully! Sent to Executive Board for review.');
      }

      // Reset form
      setTitle('');
      setExcerpt('');
      setContent('');
      setEditingBlogId(null);
      setActiveTab('history');
    } catch {
      toast.error('Failed to submit blog post.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevise = (blog: BlogPost) => {
    setTitle(blog.title);
    setExcerpt(blog.excerpt);
    setCategory(blog.category);
    setTags(blog.tags.join(', '));
    setBanner(blog.banner);
    setContent(blog.content);
    setIsLeadership(!!blog.isLeadership);
    setEditingBlogId(blog.id);
    setActiveTab('submit');
    toast.info(`Editing revised copy of "${blog.title}". Make your updates and submit.`);
  };

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-7 h-7 text-[#00A4EF]" /> Community Blogs Hub
          </h1>
          <p className="text-sm text-slate-600 dark:text-[#A8B0BB] mt-1">
            Write technical articles, share campus project insights, and track publication approvals.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 dark:bg-[#151B23] p-1 rounded-2xl border border-slate-200 dark:border-[#2A323D]">
          <Button
            variant={activeTab === 'submit' ? 'fluent' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('submit')}
            className="text-xs"
          >
            <Send className="w-3.5 h-3.5" /> {editingBlogId ? 'Revise Article' : 'Write Article'}
          </Button>
          <Button
            variant={activeTab === 'history' ? 'fluent' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('history')}
            className="text-xs"
          >
            <Clock className="w-3.5 h-3.5" /> My Submissions ({myBlogs.length})
          </Button>
        </div>
      </div>

      {activeTab === 'submit' && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-6 space-y-5 border-slate-200 dark:border-[#2A323D]">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#2A323D] pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#00A4EF]" /> {editingBlogId ? 'Revise Article Submission' : 'Create New Article'}
              </h3>
              <Badge variant="primary">{userRole}</Badge>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Article Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Building High-Performance Vector Databases with Azure OpenAI"
                  className="w-full p-3 bg-white dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A4EF] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white"
                  >
                    <option value="Web & Cloud">Web & Cloud Architecture</option>
                    <option value="Artificial Intelligence">Artificial Intelligence & ML</option>
                    <option value="DevOps & Security">DevOps & Cloud Security</option>
                    <option value="Career & Campus">Career & Campus Experiences</option>
                    <option value="Leadership Insights">Leadership Insights</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Tags (Comma-separated)</label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="e.g. Azure, Next.js, AI, OpenSource"
                    className="w-full p-2.5 bg-white dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A4EF] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Cover Banner Image URL</label>
                <input
                  type="url"
                  value={banner}
                  onChange={(e) => setBanner(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-2.5 bg-white dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A4EF] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Short Summary / Excerpt</label>
                <input
                  type="text"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Brief 1-2 sentence preview summary of the article..."
                  className="w-full p-2.5 bg-white dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A4EF] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Article Content (Markdown supported) *</label>
                <textarea
                  required
                  rows={8}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your article markdown content here..."
                  className="w-full p-3 bg-white dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A4EF] focus:outline-none font-mono"
                />
              </div>

              {canPublishLeadership && (
                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-purple-400">Publish to Core Team Leadership Insights</span>
                    <p className="text-[11px] text-slate-400">
                      As a Core Team / Leadership member, your blog can publish directly without waiting for board approval.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={isLeadership}
                    onChange={(e) => setIsLeadership(e.target.checked)}
                    className="w-5 h-5 accent-purple-500 rounded cursor-pointer"
                  />
                </div>
              )}
            </div>

            <Button variant="fluent" size="lg" className="w-full" type="submit" isLoading={isSubmitting}>
              <Send className="w-4 h-4" /> {isLeadership ? 'Publish Leadership Article' : 'Submit Article for Review'}
            </Button>
          </Card>
        </form>
      )}

      {activeTab === 'history' && (
        <div className="space-y-4">
          {myBlogs.length === 0 ? (
            <Card className="p-8 text-center border-slate-200 dark:border-[#2A323D]">
              <FileText className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">No Submitted Articles Yet</h3>
              <p className="text-xs text-slate-500 dark:text-[#A8B0BB] mt-1">Submit your first article to share your technical knowledge with the community.</p>
            </Card>
          ) : (
            myBlogs.map((b) => (
              <Card key={b.id} className="p-5 border-slate-200 dark:border-[#2A323D] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-[#2A323D] pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="primary">{b.category}</Badge>
                      {b.isLeadership && <Badge variant="purple">Leadership Insight</Badge>}
                      <span className="text-xs text-slate-500 dark:text-[#A8B0BB]">Submitted on {b.publishedDate}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{b.title}</h3>
                  </div>

                  {b.status === 'Published' && (
                    <Badge variant="success" className="px-3 py-1 text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Published
                    </Badge>
                  )}
                  {b.status === 'Pending' && (
                    <Badge variant="warning" className="px-3 py-1 text-xs">
                      <Clock className="w-3.5 h-3.5 animate-spin" /> Pending Review
                    </Badge>
                  )}
                  {b.status === 'Rejected' && (
                    <Badge variant="danger" className="px-3 py-1 text-xs">
                      <XCircle className="w-3.5 h-3.5" /> Rejected
                    </Badge>
                  )}
                </div>

                <p className="text-xs text-slate-600 dark:text-[#A8B0BB] line-clamp-2">{b.excerpt}</p>

                {b.status === 'Rejected' && b.rejectionNote && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 space-y-2">
                    <span className="text-xs font-bold text-red-400 block">Executive Board Rejection Feedback:</span>
                    <p className="text-xs text-slate-300 italic">{b.rejectionNote}</p>
                    <Button variant="outline" size="sm" onClick={() => handleRevise(b)} className="text-red-400 border-red-500/40">
                      <RotateCcw className="w-3.5 h-3.5" /> Revise & Resubmit Article
                    </Button>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
