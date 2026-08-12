'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable, Column } from '@/components/ui/data-table';
import { toast } from 'sonner';
import { Users, FileSpreadsheet, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { downloadCSV } from '@/lib/reports';

async function fetchRegistrations() {
  const res = await fetch('/api/registrations');
  if (!res.ok) return [];
  const json = await res.json();
  return json.data?.registrations || [];
}

export default function AdminRegistrationsPage() {
  const queryClient = useQueryClient();
  const { data: registrations = [], isLoading } = useQuery({
    queryKey: ['admin-registrations'],
    queryFn: fetchRegistrations,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`/api/registrations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ registrationStatus: status }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to update status');
      }
      return json.data?.registration;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-registrations'] });
      toast.success(`Registration status updated to ${variables.status}!`);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Status update failed.');
    },
  });

  const handleExport = () => {
    if (registrations.length === 0) {
      toast.error('No registrations available to export.');
      return;
    }
    const headers = ['Registration ID', 'Student Name', 'Email', 'Event', 'Submitted Date', 'Status'];
    const rows = registrations.map((r: any) => [
      r.id,
      r.user?.fullName || 'N/A',
      r.user?.email || 'N/A',
      r.event?.title || 'N/A',
      new Date(r.submittedAt).toLocaleDateString(),
      r.registrationStatus,
    ]);
    downloadCSV('event_registrations_report', headers, rows);
    toast.success('Registrations exported as CSV!');
  };

  const columns: Column<any>[] = [
    {
      key: 'id',
      header: 'Reg ID',
      render: (row) => <span className="font-mono text-xs text-[#0078D4] dark:text-[#00A4EF]">{row.id?.substring(0, 12)}...</span>,
    },
    {
      key: 'student',
      header: 'Student Name',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900 dark:text-white text-xs">{row.user?.fullName || 'Student'}</p>
          <p className="text-[11px] text-slate-600 dark:text-[#A8B0BB]">{row.user?.email}</p>
        </div>
      ),
    },
    {
      key: 'event',
      header: 'Event',
      render: (row) => <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">{row.event?.title}</span>,
    },
    {
      key: 'submittedAt',
      header: 'Date',
      render: (row) => <span className="text-xs text-slate-600 dark:text-[#A8B0BB]">{new Date(row.submittedAt).toLocaleDateString()}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => {
        const s = row.registrationStatus;
        const variant = s === 'APPROVED' ? 'success' : s === 'WAITLISTED' ? 'warning' : s === 'REJECTED' ? 'danger' : 'outline';
        return <Badge variant={variant}>{s}</Badge>;
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            disabled={updateStatusMutation.isPending}
            onClick={() => updateStatusMutation.mutate({ id: row.id, status: 'APPROVED' })}
            title="Approve Registration"
          >
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={updateStatusMutation.isPending}
            onClick={() => updateStatusMutation.mutate({ id: row.id, status: 'WAITLISTED' })}
            title="Move to Waitlist"
          >
            <Clock className="w-3.5 h-3.5 text-amber-500" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={updateStatusMutation.isPending}
            onClick={() => updateStatusMutation.mutate({ id: row.id, status: 'REJECTED' })}
            title="Reject Registration"
          >
            <XCircle className="w-3.5 h-3.5 text-rose-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-7 h-7 text-[#0078D4] dark:text-[#00A4EF]" /> Registration Management
          </h1>
          <p className="text-sm text-slate-600 dark:text-[#A8B0BB] mt-1">
            Search, filter, approve, reject, waitlist, and export event registrations. Strict capacity limit enforced.
          </p>
        </div>

        <Button variant="fluent" size="sm" onClick={handleExport} className="font-bold gap-2">
          <FileSpreadsheet className="w-4 h-4" /> Export CSV
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#00A4EF]" />
        </div>
      ) : (
        <DataTable columns={columns} data={registrations} searchPlaceholder="Search by student name or reg ID..." />
      )}
    </div>
  );
}
