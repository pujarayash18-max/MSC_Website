'use client';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Send, Briefcase, Sparkles, CheckCircle2, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface RoleItem {
  id: string;
  title: string;
  department: string;
  description: string;
  status: 'OPEN' | 'CLOSED';
}

async function fetchRoles() {
  const res = await fetch('/api/recruitment/roles');
  if (!res.ok) return [];
  const json = await res.json();
  return (json.data?.roles || []) as RoleItem[];
}

export default function JoinUsPage() {
  const { data: roles = [], isLoading } = useQuery({
    queryKey: ['recruitment-roles'],
    queryFn: fetchRoles,
  });

  const openRoles = roles.filter((r) => r.status === 'OPEN');
  const [selectedRole, setSelectedRole] = useState<RoleItem | null>(null);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [enrollment, setEnrollment] = useState('');
  const [statement, setStatement] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-select first open role once roles load
  useEffect(() => {
    if (roles.length > 0 && !selectedRole) {
      const firstOpen = roles.find((r) => r.status === 'OPEN') || roles[0];
      setSelectedRole(firstOpen);
    }
  }, [roles, selectedRole]);

  // Auto pre-fill user profile if logged in
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.data?.user) {
          const u = data.data.user;
          if (u.fullName) setFullName(u.fullName);
          if (u.email) setEmail(u.email);
          if (u.enrollmentNumber) setEnrollment(u.enrollmentNumber);
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) {
      toast.error('Please select an active role.');
      return;
    }
    if (selectedRole.status === 'CLOSED') {
      toast.error('Applications for this role are currently closed.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/recruitment/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roleId: selectedRole.id,
          roleTitle: selectedRole.title,
          fullName,
          email,
          enrollment,
          statement,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Failed to submit application.');
      }

      toast.success(json.message || `Application submitted for ${selectedRole.title}!`);
      setStatement('');
    } catch (err: any) {
      toast.error(err.message || 'Submission failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 py-8">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <Badge variant="primary" className="gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> Core Team Recruitment
        </Badge>
        <h1 className="text-4xl font-extrabold text-white tracking-tight">Join Microsoft Campus Club Leadership</h1>
        <p className="text-sm text-slate-400 leading-relaxed">
          Applications are open for student leadership positions at Marwadi University. Develop hands-on management skills, mentor peers, and guide our tech community.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Positions List */}
        <div className="space-y-4 lg:col-span-1">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-sky-400" /> Available Roles
            </h3>
            <span className="text-xs font-semibold text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-full border border-sky-500/20">
              {openRoles.length} Open
            </span>
          </div>

          <div className="space-y-3">
            {isLoading ? (
              <div className="p-8 text-center text-xs text-slate-500 border border-slate-800 rounded-2xl animate-pulse">
                Loading available leadership positions...
              </div>
            ) : roles.length === 0 ? (
              <Card className="p-6 text-center text-slate-400 text-xs">
                No recruitment roles currently configured.
              </Card>
            ) : (
              roles.map((pos) => {
                const isSelected = selectedRole?.id === pos.id;
                const isOpen = pos.status === 'OPEN';

                return (
                  <Card
                    key={pos.id}
                    onClick={() => setSelectedRole(pos)}
                    className={`p-5 space-y-2 cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'border-sky-500 bg-sky-950/30 shadow-lg shadow-sky-500/10'
                        : 'border-slate-800 hover:border-slate-700 bg-slate-900/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white">{pos.title}</h4>
                      <Badge variant={isOpen ? 'success' : 'danger'} size="sm">
                        {isOpen ? 'Open' : 'Closed'}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-sky-400 font-medium">{pos.department}</p>
                    <p className="text-xs text-slate-400 leading-relaxed">{pos.description}</p>
                  </Card>
                );
              })
            )}
          </div>
        </div>

        {/* Application Form */}
        <Card className="p-8 space-y-6 lg:col-span-2 border-sky-500/30 bg-slate-950/80 shadow-2xl">
          <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">
                Application Form:{' '}
                <span className="text-sky-400">{selectedRole ? selectedRole.title : 'Select a Role'}</span>
              </h3>
              {selectedRole && (
                <p className="text-xs text-slate-400 mt-1">
                  Department: <strong className="text-slate-200">{selectedRole.department}</strong>
                </p>
              )}
            </div>

            {selectedRole && (
              <Badge variant={selectedRole.status === 'OPEN' ? 'success' : 'danger'}>
                {selectedRole.status === 'OPEN' ? 'Accepting Applications' : 'Closed'}
              </Badge>
            )}
          </div>

          {selectedRole?.status === ('CLOSED' as any) ? (
            <div className="p-8 text-center space-y-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl">
              <Clock className="w-8 h-8 text-amber-400 mx-auto" />
              <h4 className="text-sm font-bold text-amber-200">Applications Closed</h4>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                Applications for the <strong className="text-white">{selectedRole?.title}</strong> role are currently closed for this term. Please select an open position from the left.
              </p>
            </div>
          ) : (
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
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Why do you want to join MCC leadership? *
                </label>
                <textarea
                  rows={4}
                  required
                  value={statement}
                  onChange={(e) => setStatement(e.target.value)}
                  placeholder="Describe your technical background, past experience, and what initiatives you want to launch..."
                  className="w-full p-3 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-sky-500 focus:outline-none leading-relaxed"
                />
              </div>

              <Button
                type="submit"
                variant="fluent"
                size="lg"
                className="w-full shadow-lg shadow-sky-500/20"
                isLoading={isSubmitting}
                disabled={!selectedRole || selectedRole.status === ('CLOSED' as any)}
              >
                <Send className="w-4 h-4 mr-1.5" /> Submit Leadership Application
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
