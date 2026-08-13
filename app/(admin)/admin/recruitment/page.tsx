'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { toast } from 'sonner';
import {
  Users,
  Briefcase,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { formatDateDeterministic } from '@/lib/date';

interface ApplicationItem {
  id: string;
  roleId?: string;
  roleTitle: string;
  fullName: string;
  email: string;
  enrollment: string;
  statement: string;
  status: 'PENDING' | 'SHORTLISTED' | 'ACCEPTED' | 'REJECTED';
  reviewNotes?: string;
  createdAt: string;
  role?: { id: string; title: string; department: string; status: string };
  user?: { id: string; fullName: string; email: string; profilePhoto?: string };
}

interface RoleItem {
  id: string;
  title: string;
  department: string;
  description: string;
  status: 'OPEN' | 'CLOSED';
  displayOrder: number;
}

async function fetchApplications(status?: string, roleId?: string, search?: string) {
  const params = new URLSearchParams();
  if (status && status !== 'ALL') params.append('status', status);
  if (roleId && roleId !== 'ALL') params.append('roleId', roleId);
  if (search) params.append('search', search);

  const res = await fetch(`/api/recruitment/applications?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch applications');
  const json = await res.json();
  return (json.data?.applications || []) as ApplicationItem[];
}

async function fetchRoles() {
  const res = await fetch('/api/recruitment/roles');
  if (!res.ok) throw new Error('Failed to fetch roles');
  const json = await res.json();
  return (json.data?.roles || []) as RoleItem[];
}

export default function AdminRecruitmentPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'applications' | 'roles'>('applications');

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [viewApp, setViewApp] = useState<ApplicationItem | null>(null);
  const [editAppStatus, setEditAppStatus] = useState<ApplicationItem | null>(null);
  const [newStatus, setNewStatus] = useState<'PENDING' | 'SHORTLISTED' | 'ACCEPTED' | 'REJECTED'>('PENDING');
  const [reviewNotes, setReviewNotes] = useState('');

  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleItem | null>(null);
  const [roleTitle, setRoleTitle] = useState('');
  const [roleDept, setRoleDept] = useState('');
  const [roleDesc, setRoleDesc] = useState('');
  const [roleStatus, setRoleStatus] = useState<'OPEN' | 'CLOSED'>('OPEN');

  // Queries
  const { data: applications = [], isLoading: loadingApps } = useQuery({
    queryKey: ['admin-applications', statusFilter, roleFilter, searchQuery],
    queryFn: () => fetchApplications(statusFilter, roleFilter, searchQuery),
  });

  const { data: roles = [], isLoading: loadingRoles } = useQuery({
    queryKey: ['admin-roles'],
    queryFn: fetchRoles,
  });

  // Calculate metrics
  const totalApps = applications.length;
  const pendingApps = applications.filter((a) => a.status === 'PENDING').length;
  const shortlistedApps = applications.filter((a) => a.status === 'SHORTLISTED').length;
  const openRoles = roles.filter((r) => r.status === 'OPEN').length;

  // Mutations
  const updateAppMutation = useMutation({
    mutationFn: async ({ id, status, reviewNotes }: { id: string; status: string; reviewNotes: string }) => {
      const res = await fetch(`/api/recruitment/applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, reviewNotes }),
      });
      if (!res.ok) throw new Error('Failed to update application');
      return res.json();
    },
    onSuccess: () => {
      toast.success('Application status updated successfully.');
      queryClient.invalidateQueries({ queryKey: ['admin-applications'] });
      setEditAppStatus(null);
    },
    onError: (err: any) => toast.error(err.message || 'Update failed.'),
  });

  const deleteAppMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/recruitment/applications/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete application');
      return res.json();
    },
    onSuccess: () => {
      toast.success('Application deleted.');
      queryClient.invalidateQueries({ queryKey: ['admin-applications'] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const saveRoleMutation = useMutation({
    mutationFn: async () => {
      const url = editingRole ? `/api/recruitment/roles/${editingRole.id}` : '/api/recruitment/roles';
      const method = editingRole ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: roleTitle,
          department: roleDept,
          description: roleDesc,
          status: roleStatus,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error?.message || data.error || data.message || 'Failed to save role');
      return data;
    },
    onSuccess: () => {
      toast.success(editingRole ? 'Role updated.' : 'New role created!');
      queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
      queryClient.invalidateQueries({ queryKey: ['recruitment-roles'] });
      closeRoleModal();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteRoleMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/recruitment/roles/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete role');
      return res.json();
    },
    onSuccess: () => {
      toast.success('Role deleted.');
      queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
      queryClient.invalidateQueries({ queryKey: ['recruitment-roles'] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const openCreateRoleModal = () => {
    setEditingRole(null);
    setRoleTitle('');
    setRoleDept('Computer Engineering / IT');
    setRoleDesc('');
    setRoleStatus('OPEN');
    setRoleModalOpen(true);
  };

  const openEditRoleModal = (role: RoleItem) => {
    setEditingRole(role);
    setRoleTitle(role.title);
    setRoleDept(role.department);
    setRoleDesc(role.description);
    setRoleStatus(role.status);
    setRoleModalOpen(true);
  };

  const closeRoleModal = () => {
    setRoleModalOpen(false);
    setEditingRole(null);
  };

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Badge variant="primary" className="mb-2 gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Leadership Recruitment
          </Badge>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Recruitment &amp; Applications Manager
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Review student leadership applications, shortlist candidates, and manage open club positions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant={activeTab === 'applications' ? 'fluent' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('applications')}
          >
            <Users className="w-4 h-4 mr-1.5" /> Applications ({totalApps})
          </Button>
          <Button
            variant={activeTab === 'roles' ? 'fluent' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('roles')}
          >
            <Briefcase className="w-4 h-4 mr-1.5" /> Manage Roles ({roles.length})
          </Button>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center gap-4 bg-slate-900/40 border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase">Total Applications</p>
            <h3 className="text-2xl font-extrabold text-white">{totalApps}</h3>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4 bg-slate-900/40 border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase">Pending Review</p>
            <h3 className="text-2xl font-extrabold text-amber-400">{pendingApps}</h3>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4 bg-slate-900/40 border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase">Shortlisted</p>
            <h3 className="text-2xl font-extrabold text-purple-400">{shortlistedApps}</h3>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4 bg-slate-900/40 border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase">Open Roles</p>
            <h3 className="text-2xl font-extrabold text-emerald-400">{openRoles}</h3>
          </div>
        </Card>
      </div>

      {/* TAB 1: APPLICATIONS */}
      {activeTab === 'applications' && (
        <div className="space-y-6">
          {/* Controls & Search */}
          <Card className="p-4 bg-slate-900/50 border-slate-800 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search applicant name, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending Review</option>
                <option value="SHORTLISTED">Shortlisted</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="REJECTED">Rejected</option>
              </select>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="ALL">All Positions</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title}
                  </option>
                ))}
              </select>
            </div>
          </Card>

          {/* Applications Table */}
          <Card className="overflow-hidden border-slate-800 bg-slate-950/60">
            {loadingApps ? (
              <div className="p-12 text-center text-xs text-slate-500 animate-pulse">Loading applications...</div>
            ) : applications.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400">
                No recruitment applications match your criteria.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-800">
                    <tr>
                      <th className="p-4">Applicant</th>
                      <th className="p-4">Enrollment</th>
                      <th className="p-4">Position Applied</th>
                      <th className="p-4">Submitted Date</th>
                      <th className="p-4">Decision Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {applications.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="p-4 font-medium text-white">
                          <div>
                            <p className="font-bold">{app.fullName}</p>
                            <p className="text-[11px] text-slate-400">{app.email}</p>
                          </div>
                        </td>

                        <td className="p-4 font-mono text-slate-300">{app.enrollment}</td>

                        <td className="p-4 font-semibold text-sky-400">{app.roleTitle}</td>

                        <td className="p-4 text-slate-400">
                          {formatDateDeterministic(app.createdAt)}
                        </td>

                        <td className="p-4">
                          <Badge
                            variant={
                              app.status === 'ACCEPTED'
                                ? 'success'
                                : app.status === 'SHORTLISTED'
                                ? 'purple'
                                : app.status === 'REJECTED'
                                ? 'danger'
                                : 'warning'
                            }
                          >
                            {app.status}
                          </Badge>
                        </td>

                        <td className="p-4 text-right space-x-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            title="View Statement"
                            onClick={() => setViewApp(app)}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>

                          <Button
                            variant="fluent"
                            size="sm"
                            title="Change Decision Status"
                            onClick={() => {
                              setEditAppStatus(app);
                              setNewStatus(app.status);
                              setReviewNotes(app.reviewNotes || '');
                            }}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            title="Delete Application"
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete ${app.fullName}'s application?`)) {
                                deleteAppMutation.mutate(app.id);
                              }
                            }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* TAB 2: ROLES & POSITIONS */}
      {activeTab === 'roles' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-white">Open Leadership Positions</h3>
            <Button variant="fluent" size="sm" onClick={openCreateRoleModal}>
              <Plus className="w-4 h-4 mr-1.5" /> Create New Role
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {roles.map((role) => (
              <Card key={role.id} className="p-6 space-y-3 bg-slate-950/80 border-slate-800 relative">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-base font-bold text-white">{role.title}</h4>
                    <span className="text-xs text-sky-400 font-medium">{role.department}</span>
                  </div>
                  <Badge variant={role.status === 'OPEN' ? 'success' : 'danger'}>
                    {role.status}
                  </Badge>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">{role.description}</p>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
                  <Button variant="secondary" size="sm" onClick={() => openEditRoleModal(role)}>
                    <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    onClick={() => {
                      if (confirm(`Delete role "${role.title}"?`)) {
                        deleteRoleMutation.mutate(role.id);
                      }
                    }}
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* View Application Modal */}
      {viewApp && (
        <Modal
          isOpen={!!viewApp}
          onClose={() => setViewApp(null)}
          title={`Application Details: ${viewApp.fullName}`}
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 bg-slate-900 p-4 rounded-xl border border-slate-800">
              <div>
                <p className="text-slate-400">Position Applied:</p>
                <p className="font-bold text-sky-400 text-sm">{viewApp.roleTitle}</p>
              </div>
              <div>
                <p className="text-slate-400">Status:</p>
                <Badge
                  variant={
                    viewApp.status === 'ACCEPTED'
                      ? 'success'
                      : viewApp.status === 'SHORTLISTED'
                      ? 'purple'
                      : viewApp.status === 'REJECTED'
                      ? 'danger'
                      : 'warning'
                  }
                >
                  {viewApp.status}
                </Badge>
              </div>
              <div>
                <p className="text-slate-400">Marwadi Email:</p>
                <p className="font-semibold text-white">{viewApp.email}</p>
              </div>
              <div>
                <p className="text-slate-400">Enrollment Number:</p>
                <p className="font-semibold text-white font-mono">{viewApp.enrollment}</p>
              </div>
            </div>

            <div>
              <p className="font-bold text-white mb-1">Leadership Statement / Pitch:</p>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-slate-300 leading-relaxed whitespace-pre-wrap">
                {viewApp.statement}
              </div>
            </div>

            {viewApp.reviewNotes && (
              <div>
                <p className="font-bold text-amber-400 mb-1">Admin Reviewer Notes:</p>
                <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-500/30 text-amber-200">
                  {viewApp.reviewNotes}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button variant="secondary" size="sm" onClick={() => setViewApp(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Application Status Modal */}
      {editAppStatus && (
        <Modal
          isOpen={!!editAppStatus}
          onClose={() => setEditAppStatus(null)}
          title={`Update Decision: ${editAppStatus.fullName}`}
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Decision Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as any)}
                className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
              >
                <option value="PENDING">Pending Review</option>
                <option value="SHORTLISTED">Shortlisted for Interview</option>
                <option value="ACCEPTED">Accepted / Appointed</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Admin Review Notes / Feedback</label>
              <textarea
                rows={3}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Add comments or interview schedule notes..."
                className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setEditAppStatus(null)}>
                Cancel
              </Button>
              <Button
                variant="fluent"
                size="sm"
                isLoading={updateAppMutation.isPending}
                onClick={() =>
                  updateAppMutation.mutate({
                    id: editAppStatus.id,
                    status: newStatus,
                    reviewNotes,
                  })
                }
              >
                Save Decision &amp; Notify Student
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Role Create/Edit Modal */}
      {roleModalOpen && (
        <Modal
          isOpen={roleModalOpen}
          onClose={closeRoleModal}
          title={editingRole ? 'Edit Position' : 'Create New Position'}
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Role Title *</label>
              <input
                type="text"
                required
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                placeholder="e.g. Technical Lead"
                className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Target Department *</label>
              <input
                type="text"
                required
                value={roleDept}
                onChange={(e) => setRoleDept(e.target.value)}
                placeholder="e.g. Computer Engineering / All Branches"
                className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Role Description *</label>
              <textarea
                rows={3}
                required
                value={roleDesc}
                onChange={(e) => setRoleDesc(e.target.value)}
                placeholder="Key responsibilities and initiatives..."
                className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Application Status</label>
              <select
                value={roleStatus}
                onChange={(e) => setRoleStatus(e.target.value as any)}
                className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
              >
                <option value="OPEN">Open (Accepting Submissions)</option>
                <option value="CLOSED">Closed (Hidden / Inactive)</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={closeRoleModal}>
                Cancel
              </Button>
              <Button
                variant="fluent"
                size="sm"
                isLoading={saveRoleMutation.isPending}
                onClick={() => saveRoleMutation.mutate()}
              >
                Save Role
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
