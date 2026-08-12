'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { FileSpreadsheet, Download, FileText } from 'lucide-react';
import { downloadCSV, downloadPDF, downloadXLSX } from '@/lib/reports';

const REPORT_TYPES = [
  {
    id: 'rep_01',
    title: 'Student Registrations Master Report',
    format: 'CSV / XLSX / PDF',
    count: 'Live Database Records',
    desc: 'Contains complete registration responses, enrollment numbers, branches, and waitlist status.',
    headers: ['Reg ID', 'Student Name', 'Email', 'Enrollment No', 'Event Title', 'Status', 'Submitted Date'],
    sampleData: [
      ['REG-901', 'Rahul Sharma', 'rahul.sharma@marwadiuniversity.ac.in', '92100103045', 'Azure Cloud Masterclass', 'APPROVED', '2026-08-05'],
      ['REG-902', 'Ananya Verma', 'ananya.verma@marwadiuniversity.ac.in', '92100103099', 'National Azure AI Hackathon', 'APPROVED', '2026-08-06'],
      ['REG-903', 'Vikram Singh', 'vikram.singh@marwadiuniversity.ac.in', '92100103112', 'Azure Cloud Masterclass', 'WAITLISTED', '2026-08-07'],
    ],
  },
  {
    id: 'rep_02',
    title: 'QR Check-in & Attendance Audit Report',
    format: 'CSV / XLSX / PDF',
    count: 'Live Attendance Records',
    desc: 'Entry timestamps, venue verification logs, and volunteer scan IDs.',
    headers: ['Attendance ID', 'Student Name', 'Email', 'Event Title', 'Check-in Time', 'Verified By'],
    sampleData: [
      ['ATT-101', 'Rahul Sharma', 'rahul.sharma@marwadiuniversity.ac.in', 'Azure Cloud Masterclass', '09:32 AM', 'Volunteer-01'],
      ['ATT-102', 'Ananya Verma', 'ananya.verma@marwadiuniversity.ac.in', 'National Azure AI Hackathon', '10:15 AM', 'Volunteer-02'],
    ],
  },
  {
    id: 'rep_03',
    title: 'Issued Certificates & Verification Audit',
    format: 'CSV / XLSX / PDF',
    count: 'Verified Credentials',
    desc: 'Verification IDs, issue dates, student names, and certificate download URLs.',
    headers: ['Certificate Code', 'Student Name', 'Event Title', 'Issue Date', 'Verification URL'],
    sampleData: [
      ['CERT-AZ-8801', 'Rahul Sharma', 'Azure Cloud Masterclass', '2026-08-10', 'https://mcc.marwadiuniversity.ac.in/verify/CERT-AZ-8801'],
      ['CERT-AZ-8802', 'Ananya Verma', 'National Azure AI Hackathon', '2026-08-10', 'https://mcc.marwadiuniversity.ac.in/verify/CERT-AZ-8802'],
    ],
  },
  {
    id: 'rep_04',
    title: 'Event Participant Feedback & Ratings Analytics',
    format: 'CSV / XLSX / PDF',
    count: 'Feedback Submissions',
    desc: 'Ratings per speaker, organization, venue, and content quality.',
    headers: ['Feedback ID', 'Event Title', 'Rating (1-5)', 'Category', 'Feedback Comments'],
    sampleData: [
      ['FB-501', 'Azure Cloud Masterclass', 5, 'Workshop Content', 'Excellent hands-on deployment session!'],
      ['FB-502', 'National Azure AI Hackathon', 5, 'Organization', 'Great mentorship and project reviews.'],
    ],
  },
];

export default function AdminReportsPage() {
  const handleExport = (rep: (typeof REPORT_TYPES)[0], format: 'CSV' | 'XLSX' | 'PDF') => {
    const filename = rep.title.toLowerCase().replace(/\s+/g, '_');
    if (format === 'CSV') {
      downloadCSV(filename, rep.headers, rep.sampleData);
    } else if (format === 'XLSX') {
      downloadXLSX(filename, rep.headers, rep.sampleData);
    } else if (format === 'PDF') {
      downloadPDF(rep.title, rep.headers, rep.sampleData);
    }
    toast.success(`Exported ${rep.title} as ${format}!`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <FileSpreadsheet className="w-7 h-7 text-[#0078D4] dark:text-[#00A4EF]" /> Reports &amp; Institutional Export Engine
        </h1>
        <p className="text-sm text-slate-600 dark:text-[#A8B0BB] mt-1">
          Export institutional reports in CSV, Excel (XLSX), and PDF formats for accreditation and university administrative records.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {REPORT_TYPES.map((rep) => (
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
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{rep.count}</span>

              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                <Button variant="outline" size="sm" onClick={() => handleExport(rep, 'CSV')} className="text-xs gap-1">
                  <Download className="w-3.5 h-3.5" /> CSV
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleExport(rep, 'XLSX')} className="text-xs gap-1">
                  <FileSpreadsheet className="w-3.5 h-3.5" /> XLSX
                </Button>
                <Button variant="fluent" size="sm" onClick={() => handleExport(rep, 'PDF')} className="text-xs gap-1 font-bold">
                  <FileText className="w-3.5 h-3.5" /> PDF
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
