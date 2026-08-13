'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  UserCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  Trash2,
  Briefcase,
  FileText,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { formatDateDeterministic } from '@/lib/date';

interface Application {
  id: string;
  roleId?: string;
  roleTitle: string;
  fullName: string;
  email: string;
  enrollment: string;
  statement: string;
  status: 'PENDING' | 'SHORTLISTED' | 'ACCEPTED' | 'REJECTED';
  reviewNotes?: string | null;
  createdAt: string;
  role?: {
    id: string;
    title: string;
    department: string;
    description: string;
    status: string;
  };
}

export default function StudentApplicationsPage() {
  const queryClient = useQueryClient();
  const [withdrawId, setWithdrawId] = useState<string | null>(null);

  const { data, isLoading } = useQuery<{ applications: Application[] }>({
    queryKey: ['my-applications'],
    queryFn: async () => {
      const res = await fetch('/api/recruitment/my-applications');
      if (!res.ok) throw new Error('Failed to load applications');
      const json = await res.json();
      return json.data || json;
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/recruitment/my-applications?id=${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error?.message || errData.message || 'Failed to withdraw application');
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success('Application withdrawn successfully.');
      queryClient.invalidateQueries({ queryKey: ['my-applications'] });
      setWithdrawId(null);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to withdraw application');
    },
  });

  const applications: Application[] = (data as any)?.applications || (data as any)?.data?.applications || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return (
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 px-3 py-1 text-xs font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Accepted
          </Badge>
        );
      case 'SHORTLISTED':
        return (
          <Badge className="bg-sky-500/20 text-sky-400 border-sky-500/40 px-3 py-1 text-xs font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" /> Shortlisted
          </Badge>
        );
      case 'REJECTED':
        return (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/40 px-3 py-1 text-xs font-semibold flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5" /> Rejected
          </Badge>
        );
      default:
        return (
          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/40 px-3 py-1 text-xs font-semibold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Under Review
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 bg-slate-900/80 border border-slate-800 rounded-3xl backdrop-blur-xl shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-semibold">
            <UserCheck className="w-3.5 h-3.5" /> Recruitment Management
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            My Leadership Applications
          </h1>
          <p className="text-xs text-slate-400">
            Track your application statuses, review notes, and executive team feedback for Microsoft Campus Club roles.
          </p>
        </div>
        <Link href="/join-us">
          <Button variant="fluent" size="sm" className="shadow-lg shadow-sky-500/20">
            <Briefcase className="w-4 h-4 mr-1.5" /> Apply for More Roles <ExternalLink className="w-3.5 h-3.5 ml-1" />
          </Button>
        </Link>
      </div>

      {/* Main Content */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Card key={i} className="p-6 bg-slate-900/50 border-slate-800 animate-pulse h-48 rounded-2xl" />
          ))}
        </div>
      ) : applications.length === 0 ? (
        <Card className="p-12 text-center bg-slate-900/40 border-slate-800/80 rounded-3xl space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center justify-center mx-auto">
            <Briefcase className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-white">No Applications Submitted</h3>
            <p className="text-xs text-slate-400">
              You haven't submitted any leadership or team applications yet. Join our executive core to build real-world projects and lead initiatives!
            </p>
          </div>
          <div className="pt-2">
            <Link href="/join-us">
              <Button variant="fluent" size="lg" className="shadow-lg shadow-sky-500/25">
                Explore Leadership Roles <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {applications.map((app: Application) => (
            <Card key={app.id} className="p-6 bg-slate-900/80 border-slate-800 rounded-3xl shadow-xl space-y-6 relative overflow-hidden">
              {/* Status Header Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    {app.roleTitle}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Target Department: <span className="text-slate-300 font-semibold">{app.role?.department || 'General Branch'}</span> • Applied on {formatDateDeterministic(app.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(app.status)}
                  {app.status === 'PENDING' && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setWithdrawId(app.id)}
                      className="text-xs py-1"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" /> Withdraw
                    </Button>
                  )}
                </div>
              </div>

              {/* Status Alert Banners */}
              {app.status === 'ACCEPTED' && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-emerald-200 uppercase tracking-wider">Application Accepted</h4>
                    <p className="text-xs text-emerald-300/90 mt-0.5">
                      Congratulations! Your leadership application for <strong>{app.roleTitle}</strong> has been accepted by the executive board. Our core team will reach out to you on your university email for onboarding.
                    </p>
                  </div>
                </div>
              )}

              {app.status === 'SHORTLISTED' && (
                <div className="p-4 bg-sky-500/10 border border-sky-500/30 rounded-2xl flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-sky-200 uppercase tracking-wider">Shortlisted for Next Round</h4>
                    <p className="text-xs text-sky-300/90 mt-0.5">
                      Great news! Your profile has been shortlisted. Please check your inbox regularly for interview schedules and next steps.
                    </p>
                  </div>
                </div>
              )}

              {app.status === 'REJECTED' && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-red-200 uppercase tracking-wider">Application Status</h4>
                    <p className="text-xs text-red-300/90 mt-0.5">
                      Thank you for applying. We received a high volume of candidates for {app.roleTitle}. Although you were not selected for this specific term, we encourage you to stay active in events and apply in future recruitment drives.
                    </p>
                  </div>
                </div>
              )}

              {/* Review Notes from Admin */}
              {app.reviewNotes && (
                <div className="p-4 bg-slate-800/60 border border-slate-700/60 rounded-2xl space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> Executive Team Notes
                  </span>
                  <p className="text-xs text-slate-200 italic leading-relaxed">
                    "{app.reviewNotes}"
                  </p>
                </div>
              )}

              {/* Submitted Statement Preview */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-400 block">Submitted Statement & Background:</span>
                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {app.statement}
                </div>
              </div>

              {/* Applicant Metadata */}
              <div className="flex flex-wrap gap-4 text-xs text-slate-400 pt-2 border-t border-slate-800/60">
                <span>Name: <strong className="text-slate-200">{app.fullName}</strong></span>
                <span>Email: <strong className="text-slate-200">{app.email}</strong></span>
                <span>Enrollment: <strong className="text-slate-200">{app.enrollment}</strong></span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Withdraw Modal */}
      {withdrawId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <Card className="w-full max-w-md p-6 bg-slate-900 border-slate-800 rounded-3xl space-y-4">
            <h3 className="text-lg font-bold text-white">Withdraw Application?</h3>
            <p className="text-xs text-slate-400">
              Are you sure you want to withdraw this application? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="outline" size="sm" onClick={() => setWithdrawId(null)} className="border-slate-700 text-slate-300">
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                isLoading={withdrawMutation.isPending}
                onClick={() => withdrawMutation.mutate(withdrawId)}
              >
                Confirm Withdraw
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
