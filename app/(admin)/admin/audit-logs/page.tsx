'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable, Column } from '@/components/ui/data-table';
import { toast } from 'sonner';
import { History, FileSpreadsheet, FileText } from 'lucide-react';
import { downloadCSV, downloadPDF } from '@/lib/reports';

interface AuditLogRow {
  logId: string;
  user: string;
  role: string;
  action: string;
  module: string;
  ipAddress: string;
  status: 'success' | 'failure';
  timestamp: string;
}

const MOCK_AUDIT_LOGS: AuditLogRow[] = [
  {
    logId: 'log_101',
    user: 'Rahul Sharma',
    role: 'Super Admin',
    action: 'Created Event "Azure Cloud Masterclass"',
    module: 'Events',
    ipAddress: '103.24.18.2',
    status: 'success',
    timestamp: '2026-08-25 09:12:04',
  },
  {
    logId: 'log_102',
    user: 'Admin Yash',
    role: 'Super Admin',
    action: 'Updated RBAC Permission Matrix for Website Admin',
    module: 'RBAC',
    ipAddress: '103.24.18.5',
    status: 'success',
    timestamp: '2026-08-25 09:40:19',
  },
  {
    logId: 'log_103',
    user: 'System Cascade',
    role: 'System',
    action: 'Batch Generated 142 Certificates',
    module: 'Certificates',
    ipAddress: '127.0.0.1',
    status: 'success',
    timestamp: '2026-08-25 10:00:00',
  },
];

export default function AdminAuditLogsPage() {
  const [data] = useState<AuditLogRow[]>(MOCK_AUDIT_LOGS);

  const handleExportCSV = () => {
    const headers = ['Log ID', 'Timestamp', 'User', 'Role', 'Action', 'Module', 'IP Address'];
    const rows = data.map((r) => [r.logId, r.timestamp, r.user, r.role, r.action, r.module, r.ipAddress]);
    downloadCSV('platform_audit_logs', headers, rows);
    toast.success('Audit logs exported as CSV!');
  };

  const handleExportPDF = () => {
    const headers = ['Timestamp', 'User', 'Role', 'Action', 'Module', 'IP Address'];
    const rows = data.map((r) => [r.timestamp, r.user, r.role, r.action, r.module, r.ipAddress]);
    downloadPDF('Platform Security Audit Logs', headers, rows);
    toast.success('Audit logs exported as PDF document!');
  };

  const columns: Column<AuditLogRow>[] = [
    { key: 'timestamp', header: 'Timestamp', render: (row) => <span className="font-mono text-xs text-slate-400">{row.timestamp}</span> },
    {
      key: 'user',
      header: 'User / Identity',
      render: (row) => (
        <div>
          <p className="font-bold text-white text-xs">{row.user}</p>
          <p className="text-[11px] text-sky-400">{row.role}</p>
        </div>
      ),
    },
    { key: 'action', header: 'Action Performed', render: (row) => <span className="text-xs text-slate-200 font-medium">{row.action}</span> },
    { key: 'module', header: 'Module', render: (row) => <Badge variant="primary">{row.module}</Badge> },
    { key: 'ipAddress', header: 'IP Address', render: (row) => <span className="font-mono text-xs text-slate-500">{row.ipAddress}</span> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <History className="w-7 h-7 text-sky-400" /> Platform Audit Logs
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Immutable log record of every administrative action, form update, and winner publish operation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-1 font-bold">
            <FileSpreadsheet className="w-4 h-4" /> CSV Log Archive
          </Button>
          <Button variant="fluent" size="sm" onClick={handleExportPDF} className="gap-1 font-bold">
            <FileText className="w-4 h-4" /> PDF Audit Export
          </Button>
        </div>
      </div>

      <DataTable columns={columns} data={data} searchPlaceholder="Filter audit logs by action or user..." />
    </div>
  );
}
