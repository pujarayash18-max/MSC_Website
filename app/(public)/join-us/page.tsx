'use client';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Users, Send, CheckCircle2 } from 'lucide-react';

const POSITIONS = [
  { role: 'Technical Lead', dept: 'Computer Engineering / IT', status: 'Open', desc: 'Lead cloud architecture workshops, review student projects, and build open-source tools.' },
  { role: 'Event Manager', dept: 'All Branches', status: 'Open', desc: 'Coordinate venue logistics, QR check-in scanning, and volunteer scheduling.' },
  { role: 'Media & Design Lead', dept: 'Design / Engineering', status: 'Open', desc: 'Create event banners, video highlights, and Fluent 2 social media assets.' },
  { role: 'Content Writer', dept: 'All Branches', status: 'Closed', desc: 'Write technical blogs, newsletter editions, and event press releases.' }
];

export default function JoinUsPage() {
  const [selectedRole, setSelectedRole] = useState(POSITIONS[0].role);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [enrollment, setEnrollment] = useState('');
  const [statement, setStatement] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success(`Application submitted for ${selectedRole}! Admin team will review your application.`);
      setFullName('');
      setEmail('');
      setEnrollment('');
      setStatement('');
    }, 600);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 py-8">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <Badge variant="primary">Core Team Recruitment</Badge>
        <h1 className="text-4xl font-extrabold text-white">Join Microsoft Campus Club Team</h1>
        <p className="text-sm text-slate-400">Applications are open for 2026-27 student team lead roles. Build leadership skills and shape the tech community.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Positions List */}
        <div className="space-y-4 lg:col-span-1">
          <h3 className="text-base font-bold text-white uppercase tracking-wider">Available Roles</h3>
          <div className="space-y-3">
            {POSITIONS.map((pos) => (
              <Card
                key={pos.role}
                onClick={() => pos.status === 'Open' && setSelectedRole(pos.role)}
                className={`p-5 space-y-2 cursor-pointer transition-all ${
                  selectedRole === pos.role
                    ? 'border-sky-500 bg-sky-950/30'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white">{pos.role}</h4>
                  <Badge variant={pos.status === 'Open' ? 'success' : 'danger'} size="sm">
                    {pos.status}
                  </Badge>
                </div>
                <p className="text-xs text-slate-400">{pos.desc}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Application Form */}
        <Card className="p-8 space-y-6 lg:col-span-2 border-sky-500/30">
          <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3">
            Application Form: <span className="text-sky-400">{selectedRole}</span>
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Rahul Sharma"
                  className="w-full p-3 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Marwadi Univ Email *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@marwadiuniversity.ac.in"
                  className="w-full p-3 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Enrollment Number *</label>
              <input
                type="text"
                required
                value={enrollment}
                onChange={(e) => setEnrollment(e.target.value)}
                placeholder="92100103045"
                className="w-full p-3 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-sky-500 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Why do you want to join MCC leadership? *</label>
              <textarea
                rows={4}
                required
                value={statement}
                onChange={(e) => setStatement(e.target.value)}
                placeholder="Describe your technical background, past experience, and what initiatives you want to launch..."
                className="w-full p-3 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <Button type="submit" variant="fluent" size="lg" className="w-full" isLoading={isSubmitting}>
              <Send className="w-4 h-4" /> Submit Application
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
