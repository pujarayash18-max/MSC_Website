'use client';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Ticket, Mail, Send, Loader2, MessageSquare, CheckCircle2, RefreshCw } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface ContactTicketItem {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  assignedTo?: string | null;
  responseNote?: string | null;
  createdAt: string;
}

async function fetchTickets() {
  const res = await fetch('/api/contact', {
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
    },
  });
  if (!res.ok) return [];
  const json = await res.json();
  return json.data?.tickets || [];
}

const MOCK_TICKETS: ContactTicketItem[] = [
  { id: 'tck_01', name: 'Harsh Vardhan', email: 'harsh@marwadiuniversity.ac.in', subject: 'Issue downloading Azure Workshop certificate', message: 'I completed check-in but certificate download button says pending.', status: 'OPEN', createdAt: new Date().toISOString() },
  { id: 'tck_02', name: 'Kavya Sharma', email: 'kavya@marwadiuniversity.ac.in', subject: 'Inquiry regarding Hackathon team size limit', message: 'Can our hackathon team have 5 members instead of 4?', status: 'IN_PROGRESS', createdAt: new Date().toISOString() }
];

export default function AdminTicketsPage() {
  const queryClient = useQueryClient();
  const { data: dbTickets = [], isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['admin-contact-tickets'],
    queryFn: fetchTickets,
    refetchInterval: 10000,
  });

  const tickets: ContactTicketItem[] = dbTickets.length > 0 ? dbTickets : MOCK_TICKETS;

  const [activeReplyTicketId, setActiveReplyTicketId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);

  const updateStatus = async (ticketId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/contact', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId, status: newStatus }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success(`Ticket status updated to ${newStatus}`);
        queryClient.invalidateQueries({ queryKey: ['admin-contact-tickets'] });
      } else {
        toast.error('Failed to update status', { description: json.error });
      }
    } catch {
      toast.error('Network error updating ticket status');
    }
  };

  const handleSendEmailReply = async (ticket: ContactTicketItem) => {
    if (!replyText.trim()) {
      toast.error('Reply message cannot be empty');
      return;
    }

    setIsSendingReply(true);
    try {
      const res = await fetch('/api/contact/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: ticket.id,
          replyMessage: replyText.trim(),
          newStatus: 'RESOLVED',
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        toast.success(`Email reply dispatched to ${ticket.email}! Ticket resolved.`);
        setReplyText('');
        setActiveReplyTicketId(null);
        queryClient.invalidateQueries({ queryKey: ['admin-contact-tickets'] });
      } else {
        toast.error('Failed to send email reply', { description: json.error });
      }
    } catch {
      toast.error('Error connecting to email service');
    } finally {
      setIsSendingReply(false);
    }
  };

  if (isLoading && dbTickets.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#0078D4] dark:text-[#00A4EF]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Ticket className="w-7 h-7 text-[#0078D4] dark:text-[#00A4EF]" /> Support Ticket Management
          </h1>
          <p className="text-sm text-slate-600 dark:text-[#A8B0BB] mt-1">
            Review student support tickets, receive email alerts, and reply directly to users via mail.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isRefetching}
          className="text-xs gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      <div className="space-y-4">
        {tickets.map((tck) => {
          const isReplying = activeReplyTicketId === tck.id;

          return (
            <Card key={tck.id} className="p-6 space-y-4 border-slate-200 dark:border-[#2A323D] bg-white dark:bg-[#151B23]">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-[#2A323D] pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant={tck.status === 'OPEN' || tck.status === 'Open' ? 'danger' : tck.status === 'RESOLVED' || tck.status === 'Resolved' ? 'success' : 'primary'}>
                      {tck.status}
                    </Badge>
                    <span className="text-[11px] font-mono text-[#0078D4] dark:text-[#00A4EF]">ID: #{tck.id}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      • {new Date(tck.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">{tck.subject}</h3>
                  <p className="text-xs text-slate-600 dark:text-[#A8B0BB]">
                    From: <strong>{tck.name}</strong> (&lt;<a href={`mailto:${tck.email}`} className="text-[#00A4EF] underline">{tck.email}</a>&gt;)
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="fluent"
                    size="sm"
                    onClick={() => {
                      if (isReplying) {
                        setActiveReplyTicketId(null);
                      } else {
                        setActiveReplyTicketId(tck.id);
                        setReplyText('');
                      }
                    }}
                    className="text-xs gap-1.5"
                  >
                    <Mail className="w-3.5 h-3.5" /> {isReplying ? 'Close Composer' : 'Reply via Email'}
                  </Button>

                  <select
                    value={tck.status}
                    onChange={(e) => updateStatus(tck.id, e.target.value)}
                    className="text-xs bg-slate-50 dark:bg-[#0D1117] border border-slate-200 dark:border-[#2A323D] rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="OPEN" className="bg-white dark:bg-[#151B23]">Open</option>
                    <option value="ASSIGNED" className="bg-white dark:bg-[#151B23]">Assigned</option>
                    <option value="IN_PROGRESS" className="bg-white dark:bg-[#151B23]">In Progress</option>
                    <option value="RESOLVED" className="bg-white dark:bg-[#151B23]">Resolved</option>
                    <option value="CLOSED" className="bg-white dark:bg-[#151B23]">Closed</option>
                  </select>
                </div>
              </div>

              {/* User Original Query */}
              <div className="bg-slate-50 dark:bg-[#0D1117] p-4 rounded-xl border border-slate-200 dark:border-[#2A323D] space-y-1">
                <p className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500">Student Query:</p>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  &quot;{tck.message}&quot;
                </p>
              </div>

              {/* Previous Admin Response Notes */}
              {tck.responseNote && (
                <div className="bg-sky-50 dark:bg-sky-950/20 p-4 rounded-xl border border-sky-500/30 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-sky-600 dark:text-sky-400">
                    <CheckCircle2 className="w-4 h-4" /> Previous Response Log:
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {tck.responseNote}
                  </p>
                </div>
              )}

              {/* Email Reply Composer Drawer */}
              {isReplying && (
                <div className="p-4 rounded-2xl bg-sky-500/5 border border-sky-500/30 space-y-3 mt-2 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-sky-500/20 pb-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-[#00A4EF]" /> Compose Email Reply to {tck.name}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">To: {tck.email}</span>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                      Email Response Message *
                    </label>
                    <textarea
                      rows={4}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={`Dear ${tck.name},\n\nRegarding your ticket "${tck.subject}": `}
                      className="w-full p-3 text-xs bg-white dark:bg-[#0D1117] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#00A4EF] focus:outline-none shadow-sm"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveReplyTicketId(null)}
                      className="text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="fluent"
                      size="sm"
                      onClick={() => handleSendEmailReply(tck)}
                      isLoading={isSendingReply}
                      className="text-xs gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" /> Send Email Reply & Resolve
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
