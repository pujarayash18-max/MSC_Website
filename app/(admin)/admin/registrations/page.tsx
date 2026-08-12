'use client';

import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable, Column } from '@/components/ui/data-table';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Users, FileSpreadsheet, CheckCircle, XCircle, Clock, Loader2, FileText, Calendar, Layers, Sparkles, Trash2 } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { downloadCSV, downloadMultiSheetExcel } from '@/lib/reports';

async function fetchRegistrations() {
  const res = await fetch('/api/registrations');
  if (!res.ok) return [];
  const json = await res.json();
  return json.data?.registrations || [];
}

function getStudentInfo(row: any) {
  const responses = row.responses;
  let name = row.user?.fullName || 'Student';
  let email = row.user?.email || '';

  if (responses && typeof responses === 'object' && Object.keys(responses).length > 0) {
    const entries = Object.entries(responses);

    const emailVal = entries.find(([k, v]) =>
      typeof v === 'string' && v.trim().length > 0 && (k.toLowerCase().includes('email') || (v.includes('@') && v.includes('.')))
    )?.[1];
    if (emailVal && typeof emailVal === 'string' && emailVal.includes('@')) {
      email = emailVal.trim();
    }

    const customNameEntry = entries.find(([k, v]) =>
      typeof v === 'string' &&
      v.trim().length > 0 &&
      !v.includes('@') &&
      k !== 'f_name' &&
      k !== 'f_email' &&
      (k.toLowerCase().includes('name') || k.toLowerCase().includes('full') || k.toLowerCase().includes('student') || k.toLowerCase().includes('dema'))
    )?.[1];

    const anyNameEntry = entries.find(([k, v]) =>
      typeof v === 'string' &&
      v.trim().length > 0 &&
      !v.includes('@') &&
      (k.toLowerCase().includes('name') || k.toLowerCase().includes('full') || k.toLowerCase().includes('student') || k.toLowerCase().includes('dema'))
    )?.[1];

    if (customNameEntry && typeof customNameEntry === 'string') {
      name = customNameEntry.trim();
    } else if (anyNameEntry && typeof anyNameEntry === 'string') {
      name = anyNameEntry.trim();
    } else {
      const firstStr = entries.find(([k, v]) => typeof v === 'string' && v.trim().length > 0 && !v.includes('@') && k !== 'f_name' && k !== 'f_email')?.[1];
      if (firstStr && typeof firstStr === 'string') {
        name = firstStr.trim();
      }
    }
  }

  return { name, email };
}

export default function AdminRegistrationsPage() {
  const queryClient = useQueryClient();
  const [selectedResponseRow, setSelectedResponseRow] = useState<any | null>(null);
  const [activeEventFilter, setActiveEventFilter] = useState<string>('ALL');

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

  const deleteRegistrationMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/registrations/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || json.error || 'Failed to delete registration');
      }
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-registrations'] });
      toast.success('Registration deleted successfully!');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Delete failed.');
    },
  });

  const handleDeleteRegistration = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete the registration for "${name}"? This will release their seat.`)) {
      deleteRegistrationMutation.mutate(id);
    }
  };

  // Group registrations by Event ID
  const groupedEvents = useMemo(() => {
    const groups: Record<string, { eventId: string; eventTitle: string; eventDate?: string; items: any[] }> = {};

    registrations.forEach((reg: any) => {
      const evId = reg.eventId || reg.event?.id || 'unknown';
      const title = reg.event?.title || 'Uncategorized Event';
      const date = reg.event?.startDate ? new Date(reg.event.startDate).toLocaleDateString() : '';

      if (!groups[evId]) {
        groups[evId] = {
          eventId: evId,
          eventTitle: title,
          eventDate: date,
          items: [],
        };
      }
      groups[evId].items.push(reg);
    });

    return Object.values(groups);
  }, [registrations]);

  const handleExportMultiSheetExcel = async () => {
    if (groupedEvents.length === 0) {
      toast.error('No registrations available to export.');
      return;
    }
    const headers = ['Registration ID', 'Student Name', 'Email', 'Event Title', 'Submitted Date', 'Status', 'Raw Form Responses'];

    const sheets = groupedEvents.map((g) => {
      const rows = g.items.map((r: any) => {
        const info = getStudentInfo(r);
        return [
          r.id,
          info.name,
          info.email,
          r.event?.title || g.eventTitle,
          new Date(r.submittedAt).toLocaleDateString(),
          r.registrationStatus,
          JSON.stringify(r.responses || {}),
        ];
      });
      return {
        sheetName: g.eventTitle,
        headers,
        rows,
      };
    });

    try {
      await downloadMultiSheetExcel('event_registrations_by_event', sheets);
      toast.success('Multi-Sheet Excel Workbook downloaded! Each Event has its own sheet tab.');
    } catch (e) {
      console.error(e);
      toast.error('Failed to generate Excel workbook.');
    }
  };

  const handleExportAllCSV = () => {
    if (registrations.length === 0) {
      toast.error('No registrations available to export.');
      return;
    }
    const headers = ['Registration ID', 'Student Name', 'Email', 'Event', 'Submitted Date', 'Status', 'Raw Form Responses'];
    const rows = registrations.map((r: any) => {
      const info = getStudentInfo(r);
      return [
        r.id,
        info.name,
        info.email,
        r.event?.title || 'N/A',
        new Date(r.submittedAt).toLocaleDateString(),
        r.registrationStatus,
        JSON.stringify(r.responses || {}),
      ];
    });
    downloadCSV('all_event_registrations_report', headers, rows);
    toast.success('All registrations exported as CSV!');
  };

  const handleExportEventCSV = (eventTitle: string, items: any[]) => {
    if (items.length === 0) {
      toast.error('No registrations available to export for this event.');
      return;
    }
    const headers = ['Registration ID', 'Student Name', 'Email', 'Event', 'Submitted Date', 'Status', 'Raw Form Responses'];
    const rows = items.map((r: any) => {
      const info = getStudentInfo(r);
      return [
        r.id,
        info.name,
        info.email,
        r.event?.title || eventTitle,
        new Date(r.submittedAt).toLocaleDateString(),
        r.registrationStatus,
        JSON.stringify(r.responses || {}),
      ];
    });
    const fileName = `${eventTitle.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_registrations`;
    downloadCSV(fileName, headers, rows);
    toast.success(`Exported CSV for ${eventTitle}!`);
  };

  const columns: Column<any>[] = [
    {
      key: 'id',
      header: 'Reg ID',
      render: (row) => <span className="font-mono text-xs text-[#0078D4] dark:text-[#00A4EF]">{row.id?.substring(0, 12)}...</span>,
    },
    {
      key: 'student',
      header: 'Submitted Student Details',
      render: (row) => {
        const info = getStudentInfo(row);
        return (
          <div>
            <p className="font-bold text-slate-900 dark:text-white text-xs">{info.name}</p>
            <p className="text-[11px] text-slate-600 dark:text-[#A8B0BB]">{info.email}</p>
          </div>
        );
      },
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
            onClick={() => setSelectedResponseRow(row)}
            title="View Form Entries"
            className="text-sky-400 border-sky-500/30"
          >
            <FileText className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={updateStatusMutation.isPending || deleteRegistrationMutation.isPending}
            onClick={() => updateStatusMutation.mutate({ id: row.id, status: 'APPROVED' })}
            title="Approve Registration"
          >
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={updateStatusMutation.isPending || deleteRegistrationMutation.isPending}
            onClick={() => updateStatusMutation.mutate({ id: row.id, status: 'WAITLISTED' })}
            title="Move to Waitlist"
          >
            <Clock className="w-3.5 h-3.5 text-amber-500" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={updateStatusMutation.isPending || deleteRegistrationMutation.isPending}
            onClick={() => updateStatusMutation.mutate({ id: row.id, status: 'REJECTED' })}
            title="Reject Registration"
          >
            <XCircle className="w-3.5 h-3.5 text-rose-500" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={updateStatusMutation.isPending || deleteRegistrationMutation.isPending}
            onClick={() => handleDeleteRegistration(row.id, getStudentInfo(row).name)}
            title="Delete Registration"
            className="hover:bg-rose-500/10 border-rose-500/30 text-rose-500"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  const visibleEventGroups = useMemo(() => {
    if (activeEventFilter === 'ALL') return groupedEvents;
    return groupedEvents.filter((g) => g.eventId === activeEventFilter);
  }, [groupedEvents, activeEventFilter]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-7 h-7 text-[#0078D4] dark:text-[#00A4EF]" /> Event Registration Console
          </h1>
          <p className="text-sm text-slate-600 dark:text-[#A8B0BB] mt-1">
            Registrations grouped by event sections. View student entries, update status, and export event reports.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="fluent" size="sm" onClick={handleExportMultiSheetExcel} className="font-bold gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
            <FileSpreadsheet className="w-4 h-4" /> Export Multi-Sheet Excel (.xlsx)
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportAllCSV} className="font-bold gap-2">
            <FileSpreadsheet className="w-4 h-4 text-[#00A4EF]" /> Export All (CSV)
          </Button>
        </div>
      </div>

      {/* Event Selector Filter Tabs */}
      {groupedEvents.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-200 dark:border-[#2A323D]">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mr-2">
            <Layers className="w-4 h-4 text-[#00A4EF]" /> Filter by Event:
          </span>
          <button
            onClick={() => setActiveEventFilter('ALL')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeEventFilter === 'ALL'
                ? 'bg-[#0078D4] text-white shadow-md'
                : 'bg-slate-100 dark:bg-[#11161D] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#1C232D]'
            }`}
          >
            All Events ({registrations.length})
          </button>
          {groupedEvents.map((g) => (
            <button
              key={g.eventId}
              onClick={() => setActiveEventFilter(g.eventId)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeEventFilter === g.eventId
                  ? 'bg-[#0078D4] text-white shadow-md'
                  : 'bg-slate-100 dark:bg-[#11161D] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#1C232D]'
              }`}
            >
              {g.eventTitle} ({g.items.length})
            </button>
          ))}
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#00A4EF]" />
        </div>
      ) : visibleEventGroups.length === 0 ? (
        <Card className="p-12 text-center space-y-3 border-dashed border-slate-300 dark:border-slate-800">
          <Users className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No Registrations Found</h3>
          <p className="text-xs text-slate-500 dark:text-[#A8B0BB]">
            No student registrations have been submitted for the selected filter yet.
          </p>
        </Card>
      ) : (
        /* Event Sections */
        <div className="space-y-8">
          {visibleEventGroups.map((group) => {
            const approvedCount = group.items.filter((i) => i.registrationStatus === 'APPROVED').length;
            const waitlistCount = group.items.filter((i) => i.registrationStatus === 'WAITLISTED').length;
            const pendingCount = group.items.filter((i) => i.registrationStatus === 'PENDING').length;

            return (
              <Card key={group.eventId} className="overflow-hidden border border-slate-200 dark:border-[#2A323D] bg-white dark:bg-[#0E131A] shadow-md">
                {/* Event Section Header */}
                <div className="p-5 bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 dark:from-[#11161D] dark:via-[#161D27] dark:to-[#11161D] border-b border-slate-200 dark:border-[#2A323D] flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="p-1.5 bg-[#0078D4]/10 rounded-lg text-[#00A4EF]">
                        <Sparkles className="w-4 h-4" />
                      </span>
                      <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                        {group.eventTitle}
                      </h2>
                      <Badge variant="outline" className="bg-[#0078D4]/10 text-[#00A4EF] border-[#0078D4]/30 font-bold">
                        {group.items.length} {group.items.length === 1 ? 'Registration' : 'Registrations'}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-[#A8B0BB] flex-wrap pt-1">
                      {group.eventDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-[#00A4EF]" /> Date: {group.eventDate}
                        </span>
                      )}
                      <span className="text-emerald-400 font-semibold">{approvedCount} Approved</span>
                      {waitlistCount > 0 && <span className="text-amber-400 font-semibold">{waitlistCount} Waitlisted</span>}
                      {pendingCount > 0 && <span className="text-sky-400 font-semibold">{pendingCount} Pending</span>}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportEventCSV(group.eventTitle, group.items)}
                    className="font-bold text-xs gap-2 shrink-0 border-slate-300 dark:border-slate-700"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-[#00A4EF]" /> Export {group.eventTitle} CSV
                  </Button>
                </div>

                {/* Event Table */}
                <div className="p-4">
                  <DataTable
                    columns={columns}
                    data={group.items}
                    searchPlaceholder={`Search registrations in ${group.eventTitle}...`}
                  />
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* View Form Entries Modal */}
      {selectedResponseRow && (
        <Modal
          isOpen={Boolean(selectedResponseRow)}
          onClose={() => setSelectedResponseRow(null)}
          title={`Form Entries: ${getStudentInfo(selectedResponseRow).name}`}
          description={`Registration entries submitted for ${selectedResponseRow.event?.title}`}
          maxWidth="lg"
        >
          <div className="space-y-3 py-2 text-xs">
            {selectedResponseRow.responses && Object.keys(selectedResponseRow.responses).length > 0 ? (
              Object.entries(selectedResponseRow.responses).map(([key, val]) => (
                <div key={key} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="font-mono text-[11px] font-bold text-sky-400 block capitalize">
                    {key.replace(/^f_/, '').replace(/_/g, ' ')}
                  </span>
                  <span className="text-slate-200 font-semibold block text-sm">
                    {Array.isArray(val) ? val.join(', ') : String(val || 'N/A')}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-slate-400 italic">No custom form responses recorded for this registration.</p>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
