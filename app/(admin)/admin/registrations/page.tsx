'use client';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable, Column } from '@/components/ui/data-table';
import { toast } from 'sonner';
import { Users, FileSpreadsheet, CheckCircle, XCircle, Clock } from 'lucide-react';

import { dynamicDb } from '@/lib/services/dataService';

interface AdminRegistrationRow {
  registrationId: string;
  studentName: string;
  enrollmentNumber: string;
  email: string;
  eventName: string;
  submittedAt: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Waitlisted' | 'Checked In';
}

const MOCK_DATA: AdminRegistrationRow[] = [
  {
    registrationId: 'reg_az_8801',
    studentName: 'Rahul Sharma',
    enrollmentNumber: '92100103045',
    email: 'rahul.sharma@marwadiuniversity.ac.in',
    eventName: 'Azure Cloud Architecture Masterclass',
    submittedAt: '2026-08-05 10:15',
    status: 'Approved'
  },
  {
    registrationId: 'reg_hk_9902',
    studentName: 'Ananya Verma',
    enrollmentNumber: '92100103099',
    email: 'ananya.verma@marwadiuniversity.ac.in',
    eventName: 'National Azure AI Hackathon 2026',
    submittedAt: '2026-08-06 14:20',
    status: 'Approved'
  },
  {
    registrationId: 'reg_az_8803',
    studentName: 'Vikram Singh',
    enrollmentNumber: '92100103112',
    email: 'vikram.singh@marwadiuniversity.ac.in',
    eventName: 'Azure Cloud Architecture Masterclass',
    submittedAt: '2026-08-07 09:40',
    status: 'Waitlisted'
  }
];

export default function AdminRegistrationsPage() {
  const [data, setData] = useState<AdminRegistrationRow[]>(() => {
    const saved = dynamicDb.getRegistrations();
    if (saved && saved.length > 0) {
      const mapped = saved.map((s: Record<string, unknown>) => ({
        registrationId: String(s.registrationId || s.id || `reg_${Date.now()}`),
        studentName: String(s.studentName || s.fullName || 'Student Member'),
        enrollmentNumber: String(s.enrollmentNumber || '92100103045'),
        email: String(s.email || 'student@marwadiuniversity.ac.in'),
        eventName: String(s.eventTitle || s.eventName || 'Azure Masterclass'),
        submittedAt: String(s.createdAt || '2026-08-05 10:15'),
        status: (s.status || 'Approved') as AdminRegistrationRow['status']
      }));
      return [...mapped, ...MOCK_DATA];
    }
    return MOCK_DATA;
  });

  const updateStatus = (id: string, newStatus: AdminRegistrationRow['status']) => {
    setData((prev) => {
      const updated = prev.map((item) => (item.registrationId === id ? { ...item, status: newStatus } : item));
      const target = updated.find((item) => item.registrationId === id);
      if (target) {
        dynamicDb.saveRegistration(target as unknown as Record<string, unknown>);
      }
      return updated;
    });
    toast.success(`Registration ${id} updated to ${newStatus}`);
  };

  const columns: Column<AdminRegistrationRow>[] = [
    {
      key: 'registrationId',
      header: 'Reg ID',
      render: (row) => <span className="font-mono text-xs text-[#0078D4] dark:text-[#00A4EF]">{row.registrationId}</span>
    },
    {
      key: 'studentName',
      header: 'Student Name',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900 dark:text-white text-xs">{row.studentName}</p>
          <p className="text-[11px] text-slate-600 dark:text-[#A8B0BB]">{row.enrollmentNumber}</p>
        </div>
      )
    },
    {
      key: 'eventName',
      header: 'Event',
      render: (row) => <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">{row.eventName}</span>
    },
    {
      key: 'submittedAt',
      header: 'Date',
      render: (row) => <span className="text-xs text-slate-600 dark:text-[#A8B0BB]">{row.submittedAt}</span>
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => {
        const s = row.status;
        const variant = s === 'Approved' ? 'success' : s === 'Waitlisted' ? 'warning' : 'danger';
        return <Badge variant={variant}>{s}</Badge>;
      }
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateStatus(row.registrationId, 'Approved')}
            title="Approve Registration"
          >
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateStatus(row.registrationId, 'Waitlisted')}
            title="Move to Waitlist"
          >
            <Clock className="w-3.5 h-3.5 text-amber-500" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateStatus(row.registrationId, 'Rejected')}
            title="Reject Registration"
          >
            <XCircle className="w-3.5 h-3.5 text-rose-500" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-7 h-7 text-[#0078D4] dark:text-[#00A4EF]" /> Registration Management
          </h1>
          <p className="text-sm text-slate-600 dark:text-[#A8B0BB] mt-1">
            Search, filter, approve, reject, waitlist, and export event registrations.
          </p>
        </div>

        <Button variant="fluent" size="sm" onClick={() => toast.success('Exported registrations!')}>
          <FileSpreadsheet className="w-4 h-4" /> Export CSV / Excel
        </Button>
      </div>

      <DataTable columns={columns} data={data} searchPlaceholder="Search by student name or reg ID..." />
    </div>
  );
}
