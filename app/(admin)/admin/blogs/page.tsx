'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { dynamicDb } from '@/lib/services/dataService';
import { Blog } from '@/types/content';
import { DEFAULTPERMISSIONMATRIX } from '@/types/user';
import { FileText, Plus, CheckCircle2, XCircle, Clock, AlertCircle, MessageSquare } from 'lucide-react';

export default function AdminBlogsPage() {
  const { user, role } = useAuth();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [activeTab, setActiveTab] = useState<'Pending' | 'Published' | 'Rejected' | 'CoreTeam'>('Pending');
  const [mounted, setMounted] = useState(false);

  // Reject Modal State
  const [rejectingBlog, setRejectingBlog] = useState<Blog | null>(null);
  const [rejectionNote, setRejectionNote] = useState('');

  // Core Team Direct Post Modal State
  const [showCoreTeamModal, setShowCoreTeamModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Cloud Architecture');
  const [newTags, setNewTags] = useState('Azure, Architecture, CoreTeam');
  const [newBanner, setNewBanner] = useState('https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80');
  const [newContent, setNewContent] = useState('');

  const canManageBlogs = DEFAULTPERMISSIONMATRIX[role]?.['Blogs'] === 'CRUD';

  const loadBlogs = () => {
    const list = dynamicDb.getBlogs() as Blog[];
    setBlogs(list);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
      loadBlogs();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return null;

  const handleApprove = (blog: Blog) => {
    if (!canManageBlogs) {
      toast.error('You do not have permission to approve blogs.');
      return;
    }

    const updated: Blog = {
      ...blog,
      status: 'Published',
      publishedAt: new Date().toISOString(),
      reviewedBy: user?.fullName || 'Executive Board',
      reviewedAt: new Date().toISOString()
    };

    dynamicDb.saveBlog(updated);
    loadBlogs();
    toast.success(`Blog "${blog.title}" approved and published to public website!`);
  };

  const handleOpenRejectModal = (blog: Blog) => {
    if (!canManageBlogs) {
      toast.error('You do not have permission to reject blogs.');
      return;
    }
    setRejectingBlog(blog);
    setRejectionNote('');
  };

  const handleConfirmReject = () => {
    if (!rejectionNote.trim()) {
      toast.error('Please provide a rejection note explaining the required changes.');
      return;
    }

    if (!rejectingBlog) return;

    const updated: Blog = {
      ...rejectingBlog,
      status: 'Rejected',
      rejectionNote,
      reviewedBy: user?.fullName || 'Executive Board',
      reviewedAt: new Date().toISOString()
    };

    dynamicDb.saveBlog(updated);
    loadBlogs();
    setRejectingBlog(null);
    setRejectionNote('');
    toast.error(`Blog "${rejectingBlog.title}" rejected with feedback.`);
  };

  const handleCreateCoreTeamPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      toast.error('Please enter article title and content.');
      return;
    }

    const slug = newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const tags = newTags.split(',').map((t) => t.trim()).filter(Boolean);

    const newBlog: Blog = {
      id: `blg_core_${Date.now()}`,
      blogId: `blg_core_${Date.now()}`,
      title: newTitle,
      slug,
      banner: newBanner,
      content: newContent,
      authorId: user?.userId || user?.id || 'usr_core',
      authorName: user?.fullName || 'Core Team Executive',
      authorRole: user?.roleName || 'Core Team Member',
      authorPhoto: user?.profilePhoto || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      category: newCategory,
      tags,
      readingTime: `${Math.max(3, Math.ceil(newContent.split(' ').length / 150))} min read`,
      publishedAt: new Date().toISOString(),
      status: 'Published',
      authorType: 'CoreTeam',
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    dynamicDb.saveBlog(newBlog);
    loadBlogs();
    setShowCoreTeamModal(false);
    setNewTitle('');
    setNewContent('');
    toast.success('Core Team article published immediately!');
  };

  const filteredBlogs = blogs.filter((b) => {
    if (activeTab === 'Pending') return b.status === 'Pending';
    if (activeTab === 'Published') return b.status === 'Published';
    if (activeTab === 'Rejected') return b.status === 'Rejected';
    if (activeTab === 'CoreTeam') return b.authorType === 'CoreTeam';
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <FileText className="w-7 h-7 text-sky-400" /> Executive Board Blog Review Queue
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Review community submissions, issue rejection feedback, or publish official Core Team articles.
          </p>
        </div>

        {canManageBlogs && (
          <Button variant="fluent" size="sm" onClick={() => setShowCoreTeamModal(true)} className="font-bold gap-2">
            <Plus className="w-4 h-4" /> New Core Team Post
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        <Button
          variant={activeTab === 'Pending' ? 'fluent' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('Pending')}
          className="gap-1.5"
        >
          <Clock className="w-3.5 h-3.5" /> Pending Review
          <Badge variant="warning" size="sm">
            {blogs.filter((b) => b.status === 'Pending').length}
          </Badge>
        </Button>

        <Button
          variant={activeTab === 'Published' ? 'fluent' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('Published')}
          className="gap-1.5"
        >
          <CheckCircle2 className="w-3.5 h-3.5" /> Published
          <Badge variant="success" size="sm">
            {blogs.filter((b) => b.status === 'Published').length}
          </Badge>
        </Button>

        <Button
          variant={activeTab === 'Rejected' ? 'fluent' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('Rejected')}
          className="gap-1.5"
        >
          <XCircle className="w-3.5 h-3.5" /> Rejected
          <Badge variant="danger" size="sm">
            {blogs.filter((b) => b.status === 'Rejected').length}
          </Badge>
        </Button>

        <Button
          variant={activeTab === 'CoreTeam' ? 'fluent' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('CoreTeam')}
          className="gap-1.5"
        >
          <FileText className="w-3.5 h-3.5 text-purple-400" /> Core Team Posts
          <Badge variant="primary" size="sm">
            {blogs.filter((b) => b.authorType === 'CoreTeam').length}
          </Badge>
        </Button>
      </div>

      {/* List */}
      <div className="space-y-4">
        {filteredBlogs.length === 0 ? (
          <Card className="p-10 text-center text-slate-400 text-xs border-slate-800">
            No articles found in &quot;{activeTab}&quot; category.
          </Card>
        ) : (
          filteredBlogs.map((b) => (
            <Card key={b.blogId || b.id} className="p-6 border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Badge variant={b.status === 'Published' ? 'success' : b.status === 'Pending' ? 'warning' : 'danger'}>
                      {b.status}
                    </Badge>
                    <Badge variant="outline" size="sm">{b.authorType === 'CoreTeam' ? '⭐ Core Team' : '👤 Community'}</Badge>
                    <span className="text-xs text-slate-400">• {b.category}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">{b.title}</h3>
                  <p className="text-xs text-slate-400">
                    Author: <strong className="text-slate-200">{b.authorName}</strong> ({b.authorRole || 'Community Student'})
                  </p>
                </div>

                {canManageBlogs && b.status === 'Pending' && (
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleOpenRejectModal(b)} className="border-rose-500/40 text-rose-400 hover:bg-rose-500/10 gap-1">
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </Button>
                    <Button variant="fluent" size="sm" onClick={() => handleApprove(b)} className="gap-1 bg-emerald-600 hover:bg-emerald-700 text-white">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approve & Publish
                    </Button>
                  </div>
                )}
              </div>

              {b.rejectionNote && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-2">
                  <MessageSquare className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Rejection Feedback Issued:</span>
                    <p>{b.rejectionNote}</p>
                  </div>
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Reject Dialog Modal */}
      {rejectingBlog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <Card className="max-w-md w-full p-6 space-y-4 border-rose-500/40 bg-[#151B23]">
            <div className="flex items-center gap-2 text-rose-400">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-lg font-extrabold text-white">Reject Community Submission</h3>
            </div>
            <p className="text-xs text-slate-300">
              Provide a required non-empty rejection note for <strong className="text-white">&quot;{rejectingBlog.title}&quot;</strong>. The author will see this note on their dashboard to edit and resubmit.
            </p>

            <textarea
              required
              rows={4}
              placeholder="e.g. Great topic! Please add code snippets for Step 3 and expand the Azure Static Web Apps overview section..."
              value={rejectionNote}
              onChange={(e) => setRejectionNote(e.target.value)}
              className="w-full p-3 text-xs font-mono bg-[#0B0F14] border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" size="sm" onClick={() => setRejectingBlog(null)}>
                Cancel
              </Button>
              <Button variant="fluent" size="sm" onClick={handleConfirmReject} className="bg-rose-600 hover:bg-rose-700 text-white font-bold">
                Confirm Rejection
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Core Team Direct Publish Modal */}
      {showCoreTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <Card className="max-w-xl w-full p-6 space-y-4 border-slate-800 bg-[#151B23]">
            <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-sky-400" /> New Core Team Post (Direct Publish)
            </h3>

            <form onSubmit={handleCreateCoreTeamPost} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Article Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MCC Executive Vision 2026-27"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2.5 bg-[#0B0F14] border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full p-2.5 bg-[#0B0F14] border border-slate-800 rounded-xl text-white"
                  >
                    <option value="Cloud Architecture">Cloud Architecture</option>
                    <option value="Artificial Intelligence">Artificial Intelligence</option>
                    <option value="Web Development">Web Development</option>
                    <option value="DevOps & Open Source">DevOps & Open Source</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Tags</label>
                  <input
                    type="text"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    className="w-full p-2.5 bg-[#0B0F14] border border-slate-800 rounded-xl text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Banner Image URL</label>
                <input
                  type="url"
                  value={newBanner}
                  onChange={(e) => setNewBanner(e.target.value)}
                  className="w-full p-2.5 bg-[#0B0F14] border border-slate-800 rounded-xl text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Markdown Content *</label>
                <textarea
                  required
                  rows={6}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full p-3 bg-[#0B0F14] border border-slate-800 rounded-xl text-white font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" size="sm" type="button" onClick={() => setShowCoreTeamModal(false)}>
                  Cancel
                </Button>
                <Button variant="fluent" size="sm" type="submit" className="font-bold">
                  Publish Core Team Article
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
