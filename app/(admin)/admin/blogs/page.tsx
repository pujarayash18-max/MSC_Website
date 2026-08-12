'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { getRolePermissions } from '@/types/user';
import { FileText, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { BlogPost } from '@prisma/client';

async function fetchAdminBlogs(): Promise<BlogPost[]> {
  const res = await fetch('/api/blogs', { credentials: 'include' });
  if (!res.ok) return [];
  const json = await res.json();
  return json.data?.blogs || [];
}

export default function AdminBlogsPage() {
  const queryClient = useQueryClient();
  const { role } = useAuth();
  const [activeTab, setActiveTab] = useState<'Pending' | 'Published' | 'Rejected'>('Pending');

  // Reject Modal State
  const [rejectingBlog, setRejectingBlog] = useState<BlogPost | null>(null);
  const [rejectionNote, setRejectionNote] = useState('');

  const canManageBlogs = getRolePermissions(role)['Blogs'] === 'CRUD';

  const { data: blogs = [], isLoading } = useQuery({
    queryKey: ['admin-blogs'],
    queryFn: fetchAdminBlogs,
  });

  const updateBlogStatusMutation = useMutation({
    mutationFn: async ({ id, status, rejectionNote }: { id: string; status: string; rejectionNote?: string }) => {
      const res = await fetch(`/api/blogs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status, rejectionNote }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Update failed');
      return json.data?.blog;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blogs'] });
      toast.success('Blog article status updated successfully!');
      setRejectingBlog(null);
      setRejectionNote('');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Action failed.');
    },
  });

  const handleApprove = (blog: BlogPost) => {
    if (!canManageBlogs) {
      toast.error('You do not have permission to approve blogs.');
      return;
    }
    updateBlogStatusMutation.mutate({ id: blog.id, status: 'published' });
  };

  const handleConfirmReject = () => {
    if (!rejectingBlog) return;
    if (!rejectionNote.trim()) {
      toast.error('Rejection Note Required', {
        description: 'Please enter a change request comment or rejection reason for the author.',
      });
      return;
    }
    updateBlogStatusMutation.mutate({
      id: rejectingBlog.id,
      status: 'rejected',
      rejectionNote: rejectionNote.trim(),
    });
  };

  const filteredBlogs = blogs.filter((b) => {
    if (activeTab === 'Pending') return b.status === 'pending';
    if (activeTab === 'Published') return b.status === 'published';
    if (activeTab === 'Rejected') return b.status === 'rejected';
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-7 h-7 text-[#00A4EF]" /> Blog &amp; Article Publishing Review
          </h1>
          <p className="text-sm text-slate-600 dark:text-[#A8B0BB] mt-1">
            Review student technical submissions, approve publication, or return draft with feedback.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-[#2A323D] pb-3">
        {(['Pending', 'Published', 'Rejected'] as const).map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? 'fluent' : 'outline'}
            size="sm"
            onClick={() => setActiveTab(tab)}
            className="text-xs font-semibold"
          >
            {tab}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#00A4EF]" />
        </div>
      ) : filteredBlogs.length === 0 ? (
        <div className="text-center py-16 text-slate-500">No blogs found in {activeTab} status.</div>
      ) : (
        <div className="space-y-4">
          {filteredBlogs.map((blog) => (
            <Card key={blog.id} className="p-6 space-y-4 border-slate-200 dark:border-[#2A323D] bg-white dark:bg-[#151B23]">
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={blog.status === 'published' ? 'success' : blog.status === 'pending' ? 'warning' : 'danger'}>
                      {blog.status}
                    </Badge>
                    <span className="text-xs font-semibold text-sky-400">{blog.category}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{blog.title}</h3>
                  <p className="text-xs text-slate-500">By {blog.authorName} ({blog.authorRole})</p>
                </div>

                {blog.status === 'pending' && canManageBlogs && (
                  <div className="flex items-center gap-2">
                    <Button variant="fluent" size="sm" onClick={() => handleApprove(blog)} className="gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approve &amp; Publish
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => setRejectingBlog(blog)} className="gap-1">
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </Button>
                  </div>
                )}
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3">{blog.excerpt || blog.content}</p>
            </Card>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {rejectingBlog && (
        <Modal isOpen={!!rejectingBlog} onClose={() => setRejectingBlog(null)} title="Reject Article Submission">
          <div className="space-y-4 pt-2">
            <p className="text-xs text-slate-500">Provide feedback notes for student revision:</p>
            <textarea
              rows={4}
              value={rejectionNote}
              onChange={(e) => setRejectionNote(e.target.value)}
              placeholder="e.g. Please add source code snippets for the Azure Function setup section..."
              className="w-full p-3 text-xs bg-slate-50 dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:outline-none"
            />
            <Button variant="destructive" size="sm" onClick={handleConfirmReject} className="w-full font-bold">
              Confirm Rejection
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
