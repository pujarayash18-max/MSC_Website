'use client';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const [createdTicketId, setCreatedTicketId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) return;

    setIsSending(true);
    setCreatedTicketId(null);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          subject: subject.trim(),
          message: message.trim(),
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setCreatedTicketId(json.data?.ticket?.id || 'SUBMITTED');
        toast.success(json.data?.message || 'Support ticket created! Admin has been notified.');
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
      } else {
        toast.error('Failed to submit ticket', { description: json.error || 'Please try again.' });
      }
    } catch {
      toast.error('Network error creating support ticket. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 py-8">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <Badge variant="primary">Support Portal</Badge>
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">Get in Touch</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">Have questions regarding event registrations, certificates, or sponsorships? Drop us a ticket.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Information Cards */}
        <div className="space-y-4">
          <Card className="p-6 space-y-3 border-slate-200 dark:border-slate-800">
            <MapPin className="w-6 h-6 text-sky-600 dark:text-sky-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Campus Location</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Microsoft Campus Club (MCC)<br />
              Department of Computer Engineering<br />
              Marwadi University, Rajkot-Morbi Highway, Gujarat - 360003
            </p>
          </Card>

          <Card className="p-6 space-y-3 border-slate-200 dark:border-slate-800">
            <Mail className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Email Communications</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">mcc@marwadiuniversity.ac.in</p>
          </Card>

          <Card className="p-6 space-y-3 border-slate-200 dark:border-slate-800">
            <Phone className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Faculty Helpdesk</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">+91 (0281) 7123456 (Ext. 402)</p>
          </Card>
        </div>

        {/* Support Ticket Form */}
        <Card className="p-8 space-y-6 lg:col-span-2 border-sky-500/30">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3">Submit Support Ticket</h3>

          {createdTicketId && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Support Ticket Created Successfully!</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  Ticket Reference ID: <strong className="font-mono text-emerald-500">#{createdTicketId}</strong>. Admin has received an instant email alert and a confirmation email was dispatched to your inbox.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Your Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Rahul Sharma"
                  className="w-full p-3 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:outline-none shadow-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Your Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@marwadiuniversity.ac.in"
                  className="w-full p-3 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:outline-none shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Subject *</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Issue downloading Azure Workshop certificate"
                className="w-full p-3 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:outline-none shadow-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Detailed Message / Issue Description *</label>
              <textarea
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Explain your query or technical issue..."
                className="w-full p-3 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:outline-none shadow-sm"
              />
            </div>

            <Button type="submit" variant="fluent" size="lg" className="w-full" isLoading={isSending}>
              <Send className="w-4 h-4" /> Create Support Ticket
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
