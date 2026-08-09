'use client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { FileSpreadsheet, Download, FileText, CheckCircle2 } from 'lucide-react';

const REPORT_TYPES = [
  { id: 'rep_01', title: 'Student Registrations Master Report', format: 'Excel / CSV', count: '2,480 Records', desc: 'Contains complete registration responses, enrollment numbers, branches, and waitlist status.' },
  { id: 'rep_02', title: 'QR Check-in & Attendance Audit Report', format: 'Excel / PDF', count: '1,850 Records', desc: 'Entry timestamps, venue verification logs, and volunteer scan IDs.' },
  { id: 'rep_03', title: 'Issued Certificates & Verification Audit', format: 'CSV / PDF', count: '1,850 Records', desc: 'Verification IDs, issue dates, student names, and certificate download URLs.' },
  { id: 'rep_04', title: 'Event Participant Feedback & Ratings Analytics', format: 'Excel', count: '450 Responses', desc: 'Ratings per speaker, organization, venue, and content quality.' }
];

export default function AdminReportsPage() {
  const handleGenerate = (title: string) => {
    toast.success(`Generated and downloaded ${title}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <FileSpreadsheet className="w-7 h-7 text-[#0078D4] dark:text-[#00A4EF]" /> Reports & Cross-Module Export
        </h1>
        <p className="text-sm text-slate-600 dark:text-[#A8B0BB] mt-1">
          Export institutional reports to ExcelJS and CSV for accreditation and university administrative records.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {REPORT_TYPES.map((rep) => (
          <Card key={rep.id} className="p-6 space-y-4 border-slate-200 dark:border-[#2A323D] bg-white dark:bg-[#151B23] hover:border-[#0078D4]/40 dark:hover:border-[#00A4EF]/40 transition-all">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Badge variant="primary" className="mb-2">{rep.format}</Badge>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{rep.title}</h3>
                <p className="text-xs text-slate-600 dark:text-[#A8B0BB] mt-1">{rep.desc}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-[#2A323D] flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{rep.count}</span>

              <Button variant="fluent" size="sm" onClick={() => handleGenerate(rep.title)}>
                <Download className="w-4 h-4" /> Download Report
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
