'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { FileSpreadsheet, Download, FileText, RefreshCw, Loader2 } from 'lucide-react';
import { downloadCSV, downloadPDF, downloadXLSX } from '@/lib/reports';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Registration {
  id: string;
  user: { fullName: string; email: string; studentId?: string | null };
  event: { title: string };
  registrationStatus: string;
  submittedAt: string;
}

interface Attendance {
  id: string;
  user: { fullName: string; studentId?: string | null };
  event: { title: string };
  checkInTime: string;
  verifiedBy?: string | null;
}

interface Certificate {
  verificationCode: string;
  user: { fullName: string };
  event: { title: string };
  generatedAt: string;
  blobUrl?: string | null;
}

interface Feedback {
  id: string;
  event: { title: string };
  rating: number;
  comments?: string | null;
  organizationRating?: number | null;
  venueRating?: number | null;
  contentQualityRating?: number | null;
}

interface ReportData {
  registrations: Registration[];
  attendances: Attendance[];
  certificates: Certificate[];
  feedbacks: Feedback[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtDate(iso?: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtTime(iso?: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function AdminReportsPage() {
  const [data, setData] = useState<ReportData>({
    registrations: [],
    attendances: [],
    certificates: [],
    feedbacks: [],
  });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<string | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [regRes, attRes, certRes, fbRes] = await Promise.all([
        fetch('/api/registrations'),
        fetch('/api/attendance'),
        fetch('/api/certificates'),
        fetch('/api/feedback'),
      ]);

      const [regJson, attJson, certJson, fbJson] = await Promise.all([
        regRes.json(),
        attRes.json(),
        certRes.json(),
        fbRes.json(),
      ]);

      setData({
        registrations: regJson?.data?.registrations ?? [],
        attendances: attJson?.data?.attendances ?? [],
        certificates: certJson?.data?.certificates ?? [],
        feedbacks: fbJson?.data?.feedbacks ?? [],
      });
    } catch (e) {
      console.error('[Reports fetchAll]', e);
      toast.error('Failed to load live records from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // ─── Build rows from live DB data ─────────────────────────────────────────

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://mcc.marwadiuniversity.ac.in';

  const registrationHeaders = ['Reg ID', 'Student Name', 'Email', 'Enrollment No', 'Event Title', 'Status', 'Submitted Date'];
  const registrationRows = data.registrations.map((r) => [
    r.id.slice(0, 10).toUpperCase(),
    r.user?.fullName ?? '—',
    r.user?.email ?? '—',
    r.user?.studentId ?? '—',
    r.event?.title ?? '—',
    r.registrationStatus ?? '—',
    fmtDate(r.submittedAt),
  ]);

  const attendanceHeaders = ['Attendance ID', 'Student Name', 'Enrollment No', 'Event Title', 'Check-in Date', 'Check-in Time', 'Verified By'];
  const attendanceRows = data.attendances.map((a) => [
    a.id.slice(0, 10).toUpperCase(),
    a.user?.fullName ?? '—',
    a.user?.studentId ?? '—',
    a.event?.title ?? '—',
    fmtDate(a.checkInTime),
    fmtTime(a.checkInTime),
    a.verifiedBy ?? '—',
  ]);

  const certificateHeaders = ['Certificate Code', 'Student Name', 'Event Title', 'Issue Date', 'Verification URL'];
  const certificateRows = data.certificates.map((c) => [
    c.verificationCode,
    c.user?.fullName ?? '—',
    c.event?.title ?? '—',
    fmtDate(c.generatedAt),
    c.blobUrl ?? `${baseUrl}/verify/${c.verificationCode}`,
  ]);

  const feedbackHeaders = ['Feedback ID', 'Event Title', 'Overall Rating (1-5)', 'Organization Rating', 'Venue Rating', 'Content Quality', 'Comments'];
  const feedbackRows = data.feedbacks.map((f) => [
    f.id.slice(0, 10).toUpperCase(),
    f.event?.title ?? '—',
    f.rating,
    f.organizationRating ?? '—',
    f.venueRating ?? '—',
    f.contentQualityRating ?? '—',
    f.comments ?? '—',
  ]);

  // ─── Report definitions (live) ────────────────────────────────────────────

  const REPORT_TYPES = [
    {
      id: 'rep_01',
      title: 'Student Registrations Master Report',
      format: 'CSV / XLSX / PDF',
      count: `${data.registrations.length} Live Record${data.registrations.length !== 1 ? 's' : ''}`,
      desc: 'Contains complete registration responses, enrollment numbers, branches, and waitlist status.',
      headers: registrationHeaders,
      rows: registrationRows,
    },
    {
      id: 'rep_02',
      title: 'QR Check-in & Attendance Audit Report',
      format: 'CSV / XLSX / PDF',
      count: `${data.attendances.length} Live Record${data.attendances.length !== 1 ? 's' : ''}`,
      desc: 'Entry timestamps, venue verification logs, and volunteer scan IDs.',
      headers: attendanceHeaders,
      rows: attendanceRows,
    },
    {
      id: 'rep_03',
      title: 'Issued Certificates & Verification Audit',
      format: 'CSV / XLSX / PDF',
      count: `${data.certificates.length} Verified Credential${data.certificates.length !== 1 ? 's' : ''}`,
      desc: 'Verification IDs, issue dates, student names, and certificate download URLs.',
      headers: certificateHeaders,
      rows: certificateRows,
    },
    {
      id: 'rep_04',
      title: 'Event Participant Feedback & Ratings Analytics',
      format: 'CSV / XLSX / PDF',
      count: `${data.feedbacks.length} Feedback Submission${data.feedbacks.length !== 1 ? 's' : ''}`,
      desc: 'Ratings per speaker, organization, venue, and content quality.',
      headers: feedbackHeaders,
      rows: feedbackRows,
    },
  ];

  // ─── Export handler ───────────────────────────────────────────────────────

  const handleExport = async (rep: (typeof REPORT_TYPES)[0], format: 'CSV' | 'XLSX' | 'PDF') => {
    if (rep.rows.length === 0) {
      toast.warning(`No data available to export for "${rep.title}".`);
      return;
    }
    const key = `${rep.id}_${format}`;
    setExporting(key);
    try {
      const filename = rep.title.toLowerCase().replace(/\s+/g, '_');
      if (format === 'CSV') downloadCSV(filename, rep.headers, rep.rows);
      else if (format === 'XLSX') downloadXLSX(filename, rep.headers, rep.rows);
      else if (format === 'PDF') downloadPDF(rep.title, rep.headers, rep.rows);
      toast.success(`Exported "${rep.title}" as ${format} — ${rep.rows.length} rows.`);
    } catch (e) {
      console.error('[Export Error]', e);
      toast.error('Export failed. Please try again.');
    } finally {
      setExporting(null);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <FileSpreadsheet className="w-7 h-7 text-[#0078D4] dark:text-[#00A4EF]" /> Reports &amp; Institutional Export Engine
          </h1>
          <p className="text-sm text-slate-600 dark:text-[#A8B0BB] mt-1">
            Export institutional reports in CSV, Excel (XLSX), and PDF formats for accreditation and university administrative records.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchAll}
          disabled={loading}
          className="shrink-0 gap-1.5 text-xs"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24 text-slate-500 dark:text-[#A8B0BB] gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-[#0078D4]" />
          <span className="text-sm font-medium">Fetching live records from database…</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {REPORT_TYPES.map((rep) => {
            const isEmpty = rep.rows.length === 0;
            return (
              <Card
                key={rep.id}
                className="p-6 space-y-4 border-slate-200 dark:border-[#2A323D] bg-white dark:bg-[#151B23] hover:border-[#0078D4]/40 dark:hover:border-[#00A4EF]/40 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Badge variant="primary" className="mb-2">
                      {rep.format}
                    </Badge>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{rep.title}</h3>
                    <p className="text-xs text-slate-600 dark:text-[#A8B0BB] mt-1">{rep.desc}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-[#2A323D] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <span className={`text-xs font-semibold ${isEmpty ? 'text-slate-400 dark:text-slate-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {rep.count}
                  </span>

                  <div className="flex items-center gap-1.5 w-full sm:w-auto">
                    {(['CSV', 'XLSX', 'PDF'] as const).map((fmt) => {
                      const key = `${rep.id}_${fmt}`;
                      const isExporting = exporting === key;
                      return (
                        <Button
                          key={fmt}
                          variant={fmt === 'PDF' ? 'fluent' : 'outline'}
                          size="sm"
                          onClick={() => handleExport(rep, fmt)}
                          disabled={isExporting || loading || isEmpty}
                          className="text-xs gap-1 font-bold"
                        >
                          {isExporting ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : fmt === 'CSV' ? (
                            <Download className="w-3.5 h-3.5" />
                          ) : fmt === 'XLSX' ? (
                            <FileSpreadsheet className="w-3.5 h-3.5" />
                          ) : (
                            <FileText className="w-3.5 h-3.5" />
                          )}
                          {fmt}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
