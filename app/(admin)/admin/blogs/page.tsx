'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { FileText, CheckCircle2, XCircle, Clock, Trash2, Eye, ShieldCheck } from 'lucide-react';
import { dynamicDb, BlogPost } from '@/lib/services/dataService';

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Published' | 'Rejected'>('Pending');

  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [rejectionNote, setRejectionNote] = useState('');

  const loadBlogs = () => {
    setBlogs(dynamicDb.getBlogs());
  };

  useEffect(() => {
    loadBlogs();
  }, []);

  const handleApprove = (blogId: string, title: string) => {
    dynamicDb.updateBlogStatus(blogId, 'Published');
    loadBlogs();
    toast.success(`Blog "${title}" approved and published to public community site!`);
  };

  const handleRejectClick = (blog: BlogPost) => {
    setSelectedBlog(blog);
    setRejectionNote('');
    setShowRejectModal(true);
  };

  const handleConfirmReject = () => {
    if (!selectedBlog) return;
    if (!rejectionNote.trim()) {
      toast.error('Please enter a mandatory rejection feedback note for the author.');
      return;
    }

    dynamicDb.updateBlogStatus(selectedBlog.id, 'Rejected', rejectionNote.trim());
    loadBlogs();
    setShowRejectModal(false);
    setSelectedBlog(null);
    toast.error(`Blog rejected. Rejection note sent to author.`);
  };

  const handleDelete = (blogId: string) => {
    if (confirm('Are you sure you want to delete this blog post?')) {
      dynamicDb.deleteBlog(blogId);
      loadBlogs();
      toast.success('Blog post deleted.');
    }
  };

  const filteredBlogs = blogs.filter((b) => {
    if (filter === 'All') return true;
    return b.status === filter;
  });

  const pendingCount = blogs.filter((b) => b.status === 'Pending').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-[#00A4EF]" /> Executive Board Blog Review Portal
          </h1>
          <p className="text-sm text-slate-600 dark:text-[#A8B0BB] mt-1">
            Review member blog submissions, verify technical quality, and approve or reject articles.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 dark:bg-[#151B23] p-1 rounded-2xl border border-slate-200 dark:border-[#2A323D]">
          {(['Pending', 'Published', 'Rejected', 'All'] as const).map((tab) => (
            <Button
              key={tab}
              variant={filter === tab ? 'fluent' : 'ghost'}
              size="sm"
              onClick={() => setFilter(tab)}
              className="text-xs relative"
            >
              {tab === 'Pending' ? `Pending (${pendingCount})` : tab}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredBlogs.length === 0 ? (
          <Card className="p-8 text-center border-slate-200 dark:border-[#2A323D]">
            <FileText className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No {filter} Blog Submissions</h3>
            <p className="text-xs text-slate-500 dark:text-[#A8B0BB] mt-1">Check another filter tab or review upcoming member submissions.</p>
          </Card>
        ) : (
          filteredBlogs.map((b) => (
            <Card key={b.id} className="p-5 border-slate-200 dark:border-[#2A323D] space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-[#2A323D] pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={b.status === 'Published' ? 'success' : b.status === 'Pending' ? 'warning' : 'danger'}>
                      {b.status}
                    </Badge>
                    <Badge variant="primary" size="sm">{b.category}</Badge>
                    {b.isLeadership && <Badge variant="purple">Leadership Post</Badge>}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{b.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-[#A8B0BB]">
                    Author: <span className="font-semibold text-slate-800 dark:text-white">{b.author}</span> ({b.authorRole}) • Submitted: {b.publishedDate}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedBlog(b);
                      setShowPreviewModal(true);
                    }}
                  >
                    <Eye className="w-3.5 h-3.5" /> Inspect
                  </Button>

                  {b.status === 'Pending' && (
                    <>
                      <Button
                        variant="fluent"
                        size="sm"
                        onClick={() => handleApprove(b.id, b.title)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approve & Publish
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRejectClick(b)}
                        className="text-red-400 border-red-500/40 hover:bg-red-500/10"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject Post
                      </Button>
                    </>
                  )}

                  {b.status === 'Published' && (
                    <Button variant="outline" size="sm" onClick={() => dynamicDb.updateBlogStatus(b.id, 'Pending')}>
                      Unpublish
                    </Button>
                  )}

                  <Button variant="ghost" size="sm" onClick={() => handleDelete(b.id)} className="text-slate-400 hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-[#A8B0BB] line-clamp-2">{b.excerpt}</p>

              {b.status === 'Rejected' && b.rejectionNote && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs">
                  <span className="font-bold text-red-400 block mb-0.5">Board Rejection Note:</span>
                  <p className="text-slate-300 italic">{b.rejectionNote}</p>
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && selectedBlog && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 space-y-4 bg-slate-900 border-red-500/40 text-white">
            <h3 className="text-lg font-bold flex items-center gap-2 text-red-400">
              <XCircle className="w-5 h-5" /> Reject Blog Submission
            </h3>
            <p className="text-xs text-slate-300">
              Provide mandatory revision feedback for <span className="font-semibold text-white">"{selectedBlog.title}"</span>. The author will be notified to revise and resubmit.
            </p>

            <div>
              <label className="text-xs font-semibold block mb-1">Rejection Feedback / Reason *</label>
              <textarea
                rows={4}
                required
                value={rejectionNote}
                onChange={(e) => setRejectionNote(e.target.value)}
                placeholder="Specify what needs improvement (e.g. Add technical diagrams, fix formatting, cite official Azure docs)..."
                className="w-full p-3 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setShowRejectModal(false)}>
                Cancel
              </Button>
              <Button variant="destructive" size="sm" onClick={handleConfirmReject}>
                Submit Rejection
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && selectedBlog && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full p-6 space-y-4 bg-slate-900 border-slate-700 text-white max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <Badge variant="primary">{selectedBlog.category}</Badge>
                <h3 className="text-lg font-bold mt-1">{selectedBlog.title}</h3>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowPreviewModal(false)}>✕</Button>
            </div>
            <p className="text-xs text-slate-400">By {selectedBlog.author} ({selectedBlog.authorRole})</p>
            <div className="text-xs text-slate-200 whitespace-pre-wrap font-mono bg-slate-950 p-4 rounded-xl border border-slate-800">
              {selectedBlog.content}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

