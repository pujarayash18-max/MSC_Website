'use client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Lock, Eye, FileText } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center space-y-4">
        <Badge variant="primary">Legal & Privacy</Badge>
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">Privacy Policy</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Last updated: August 2026 • Microsoft Campus Club (MCC), Marwadi University
        </p>
      </div>

      <Card className="p-8 space-y-8 border-slate-200 dark:border-slate-800">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-sky-500">
            <ShieldCheck className="w-6 h-6" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">1. Information We Collect</h2>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            The Microsoft Campus Club (MCC) platform collects minimal student information necessary for event registrations, digital QR attendance verification, certificate issuance, and leaderboard statistics. This includes your student full name, institutional email address, enrollment number, department, academic year, and event submission data.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 text-purple-500">
            <Lock className="w-6 h-6" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">2. How Your Data Is Used</h2>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Your data is strictly utilized to manage your participation in workshops, hackathons, and community programs. We process attendance scans to generate verified certificates and award community points. We do not sell, rent, or distribute student personal data to third parties.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 text-emerald-500">
            <Eye className="w-6 h-6" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">3. Data Security & Storage</h2>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            All stored student records and resources are protected using Azure Cosmos DB enterprise security, HTTPS encryption in transit, and role-based access control (RBAC). Digital QR pass tokens are signed server-side and contain no sensitive personal credentials.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 text-amber-500">
            <FileText className="w-6 h-6" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">4. Student Rights & Contact</h2>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Students have the right to request access to their attendance history, dynamic form submissions, and earned certificates, or request profile updates by contacting our faculty coordination team at <a href="mailto:mcc@marwadiuniversity.ac.in" className="text-sky-500 underline">mcc@marwadiuniversity.ac.in</a>.
          </p>
        </div>
      </Card>
    </div>
  );
}
