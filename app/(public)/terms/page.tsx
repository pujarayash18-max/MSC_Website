'use client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Scale, CheckCircle2, AlertTriangle, Users } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center space-y-4">
        <Badge variant="primary">Terms & Conditions</Badge>
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">Terms of Service</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Last updated: August 2026 • Microsoft Campus Club (MCC), Marwadi University
        </p>
      </div>

      <Card className="p-8 space-y-8 border-slate-200 dark:border-slate-800">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-sky-500">
            <Scale className="w-6 h-6" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">1. Acceptance of Terms</h2>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            By accessing or registering on the Microsoft Campus Club (MCC) Management Platform at Marwadi University, you agree to comply with these terms, student code of conduct, and university academic guidelines.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 text-emerald-500">
            <CheckCircle2 className="w-6 h-6" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">2. Event Registrations & QR Passes</h2>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Every event registration generates a unique, non-transferable digital QR attendance pass. Duplicate check-in attempts or sharing QR passes with non-registered individuals are strictly prohibited.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 text-amber-500">
            <AlertTriangle className="w-6 h-6" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">3. Certificates & Achievements</h2>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Certificates of participation, winner badges, and community leaderboard points are awarded strictly based on verified attendance records and event evaluation rules. Verification links can be validated publicly at <code className="text-sky-500 font-mono">/verify-certificate</code>.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 text-purple-500">
            <Users className="w-6 h-6" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">4. Code of Conduct</h2>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            MCC is an inclusive learning environment. Members must maintain professional etiquette during workshops, hackathons, and community discussions. Discrimination, harassment, or unethical behavior will result in account suspension and referral to faculty coordinators.
          </p>
        </div>
      </Card>
    </div>
  );
}
