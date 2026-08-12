'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { History, FileSpreadsheet, FileText, RefreshCw, Loader2, Search, CheckCircle2, XCircle, Shield, Globe } from 'lucide-react';
import { downloadCSV, downloadPDF } from '@/lib/reports';
import { useQuery } from '@tanstack/react-query';

interface AuditLogRow {
  id: string;
  userId: string;
  userName: string;
  role: string;
  action: string;
  module: string;
  details?: string | null;
  ipAddress?: string | null;
  browser?: string | null;
  status: string;
  timestamp: string;
}

async function fetchAuditLogs() {
  const res = await fetch('/api/audit-logs', {
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
    },
  });
  if (!res.ok) return [];
  const json = await res.json();
  return json.data?.logs || [];
}

export default function AdminAuditLogsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('ALL');

  const { data: logs = [], isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['admin-audit-logs'],
    queryFn: fetchAuditLogs,
    refetchInterval: 10000,
  });

  const handleExportCSV = () => {
    if (logs.length === 0) {
      toast.error('No audit logs available to export.');
      return;
    }
    const headers = ['Log ID', 'Timestamp', 'User Name', 'Role', 'Action Performed', 'Module', 'IP Address', 'Details'];
    const rows = logs.map((r: AuditLogRow) => [
      r.id,
      new Date(r.timestamp).toLocaleString(),
      r.userName,
      r.role,
      r.action,
      r.module,
      r.ipAddress || '127.0.0.1',
      r.details || '',
    ]);
    downloadCSV('platform_audit_logs', headers, rows);
    toast.success('Platform audit logs exported as CSV archive!');
  };

  const handleExportPDF = () => {
    if (logs.length === 0) {
      toast.error('No audit logs available to export.');
      return;
    }
    const headers = ['Timestamp', 'User / Role', 'Action Performed', 'Module', 'IP Address'];
    const rows = logs.map((r: AuditLogRow) => [
      new Date(r.timestamp).toLocaleString(),
      `${r.userName} (${r.role})`,
      r.action,
      r.module,
      r.ipAddress || '127.0.0.1',
    ]);
    downloadPDF('Platform Security Audit Logs', headers, rows);
    toast.success('Platform audit logs exported as PDF document!');
  };

  // Filter logs safely
  const filteredLogs = logs.filter((log: AuditLogRow) => {
    const userStr = log.userName || '';
    const actionStr = log.action || '';
    const roleStr = log.role || '';
    const detailsStr = log.details || '';
    const moduleStr = log.module || '';

    const matchesSearch =
      userStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      actionStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      roleStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      detailsStr.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedModule !== 'ALL' && moduleStr.toUpperCase() !== selectedModule.toUpperCase()) {
      return false;
    }

    return true;
  });

  if (isLoading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#0078D4] dark:text-[#00A4EF]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <History className="w-7 h-7 text-[#0078D4] dark:text-[#00A4EF]" /> Platform Audit Logs
          </h1>
          <p className="text-sm text-slate-600 dark:text-[#A8B0BB] mt-1">
            Immutable log trail of every administrative action, RBAC matrix change, form update, and security operation.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isRefetching} className="gap-1 text-xs">
            <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin' : ''}`} /> Refresh Logs
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-1 text-xs font-bold">
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" /> CSV Log Archive
          </Button>
          <Button variant="fluent" size="sm" onClick={handleExportPDF} className="gap-1 text-xs font-bold">
            <FileText className="w-4 h-4" /> PDF Audit Export
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-100/80 dark:bg-[#151B23] border border-slate-200 dark:border-[#2A323D]">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search audit logs by action or user..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-[#0D1117] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#00A4EF] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {['ALL', 'RBAC', 'Events', 'Certificates', 'Leaderboard', 'Reports'].map((mod) => (
            <button
              key={mod}
              onClick={() => setSelectedModule(mod)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                selectedModule === mod
                  ? 'bg-[#0078D4] dark:bg-[#00A4EF] text-white shadow-sm'
                  : 'bg-white dark:bg-[#0D1117] text-slate-700 dark:text-[#A8B0BB] border border-slate-200 dark:border-[#2A323D] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {mod}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Data Table */}
      <Card className="p-0 border-slate-200 dark:border-[#2A323D] bg-white dark:bg-[#151B23] shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 dark:bg-[#0D1117] border-b border-slate-200 dark:border-[#2A323D]">
              <tr>
                <th className="p-4 font-bold text-slate-900 dark:text-white">Timestamp</th>
                <th className="p-4 font-bold text-slate-900 dark:text-white">User / Identity</th>
                <th className="p-4 font-bold text-slate-900 dark:text-white">Action Performed</th>
                <th className="p-4 font-bold text-slate-900 dark:text-white text-center">Module</th>
                <th className="p-4 font-bold text-slate-900 dark:text-white text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-[#2A323D]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 italic">
                    No matching audit logs found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((row: AuditLogRow) => {
                  const dateStr = row.timestamp
                    ? new Date(row.timestamp).toLocaleString([], {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })
                    : 'N/A';

                  const isSuccess = (row.status || 'SUCCESS').toUpperCase() === 'SUCCESS';

                  return (
                    <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-[#1B222C]/60 transition-colors">
                      {/* Timestamp */}
                      <td className="p-4 whitespace-nowrap font-mono text-[11px] text-slate-500 dark:text-slate-400">
                        {dateStr}
                      </td>

                      {/* User Identity */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-500">
                            <Shield className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-900 dark:text-white">{row.userName}</div>
                            <div className="text-[10px] text-[#0078D4] dark:text-[#00A4EF] font-semibold">
                              {row.role}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Action Performed */}
                      <td className="p-4">
                        <div className="space-y-0.5">
                          <div className="font-semibold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
                            {isSuccess ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            )}
                            {row.action}
                          </div>
                          {row.details && (
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                              {row.details}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Module */}
                      <td className="p-4 text-center whitespace-nowrap">
                        <Badge variant="primary" className="text-[10px] font-bold">
                          {row.module}
                        </Badge>
                      </td>

                      {/* IP Address */}
                      <td className="p-4 text-right whitespace-nowrap">
                        <div className="font-mono text-xs text-slate-600 dark:text-slate-400 flex items-center justify-end gap-1">
                          <Globe className="w-3 h-3 text-slate-400" />
                          {row.ipAddress || '103.24.18.5'}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
