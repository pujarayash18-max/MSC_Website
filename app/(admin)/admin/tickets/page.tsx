'use client';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TicketStatus } from '@/types';
import { toast } from 'sonner';
import { Ticket } from 'lucide-react';

const MOCK_TICKETS = [
  { ticketId: 'tck_01', name: 'Harsh Vardhan', email: 'harsh@marwadiuniversity.ac.in', subject: 'Issue downloading Azure Workshop certificate', message: 'I completed check-in but certificate download button says pending.', status: 'Open' as TicketStatus, assignedTo: 'Rahul Sharma' },
  { ticketId: 'tck_02', name: 'Kavya Sharma', email: 'kavya@marwadiuniversity.ac.in', subject: 'Inquiry regarding Hackathon team size limit', message: 'Can our hackathon team have 5 members instead of 4?', status: 'In Progress' as TicketStatus, assignedTo: 'Ananya Verma' }
];

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState(MOCK_TICKETS);

  const updateStatus = (id: string, newStatus: TicketStatus) => {
    setTickets((prev) =>
      prev.map((t) => (t.ticketId === id ? { ...t, status: newStatus } : t))
    );
    toast.success(`Ticket ${id} status updated to ${newStatus}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Ticket className="w-7 h-7 text-[#0078D4] dark:text-[#00A4EF]" /> Support Ticket Management
        </h1>
        <p className="text-sm text-slate-600 dark:text-[#A8B0BB] mt-1">
          Review student contact form submissions, assign admin owners, and resolve tickets.
        </p>
      </div>

      <div className="space-y-4">
        {tickets.map((tck) => (
          <Card key={tck.ticketId} className="p-6 space-y-4 border-slate-200 dark:border-[#2A323D] bg-white dark:bg-[#151B23]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-[#2A323D] pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant={tck.status === 'Open' ? 'danger' : 'primary'}>{tck.status}</Badge>
                  <span className="text-[11px] font-mono text-[#0078D4] dark:text-[#00A4EF]">ID: {tck.ticketId}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">{tck.subject}</h3>
                <p className="text-xs text-slate-600 dark:text-[#A8B0BB]">From: {tck.name} ({tck.email})</p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={tck.status}
                  onChange={(e) => updateStatus(tck.ticketId, e.target.value as TicketStatus)}
                  className="text-xs bg-slate-50 dark:bg-[#0D1117] border border-slate-200 dark:border-[#2A323D] rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                >
                  <option value="Open" className="bg-white dark:bg-[#151B23]">Open</option>
                  <option value="Assigned" className="bg-white dark:bg-[#151B23]">Assigned</option>
                  <option value="In Progress" className="bg-white dark:bg-[#151B23]">In Progress</option>
                  <option value="Resolved" className="bg-white dark:bg-[#151B23]">Resolved</option>
                  <option value="Closed" className="bg-white dark:bg-[#151B23]">Closed</option>
                </select>
              </div>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-[#0D1117] p-4 rounded-xl border border-slate-200 dark:border-[#2A323D]">
              &quot;{tck.message}&quot;
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
