'use client';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Settings, Save, Shield, Database, Lock } from 'lucide-react';

export default function AdminSettingsPage() {
  const [clubName, setClubName] = useState('Microsoft Campus Club - Marwadi University');
  const [contactEmail, setContactEmail] = useState('mcc@marwadiuniversity.ac.in');
  const [firstPoints, setFirstPoints] = useState(100);
  const [secondPoints, setSecondPoints] = useState(80);
  const [thirdPoints, setThirdPoints] = useState(50);
  const [participantPoints, setParticipantPoints] = useState(20);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Global system settings updated successfully!');
    }, 600);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-7 h-7 text-[#0078D4] dark:text-[#00A4EF]" /> Global System Settings (§86)
        </h1>
        <p className="text-sm text-slate-600 dark:text-[#A8B0BB] mt-1">
          Configure default points allocation, club branding, email templates, and maintenance mode.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Points Configuration (§86, §77) */}
        <Card className="p-6 space-y-4 border-slate-200 dark:border-[#2A323D] bg-white dark:bg-[#151B23]">
          <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-[#2A323D] pb-3 flex items-center gap-2">
            <Database className="w-4 h-4 text-amber-500" /> Default Gamification Points Engine
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">1st Place Points</label>
              <input
                type="number"
                value={firstPoints}
                onChange={(e) => setFirstPoints(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 dark:bg-[#0D1117] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white font-bold"
              />
            </div>

            <div>
              <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">2nd Place Points</label>
              <input
                type="number"
                value={secondPoints}
                onChange={(e) => setSecondPoints(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 dark:bg-[#0D1117] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white font-bold"
              />
            </div>

            <div>
              <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">3rd Place Points</label>
              <input
                type="number"
                value={thirdPoints}
                onChange={(e) => setThirdPoints(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 dark:bg-[#0D1117] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white font-bold"
              />
            </div>

            <div>
              <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Participant Points</label>
              <input
                type="number"
                value={participantPoints}
                onChange={(e) => setParticipantPoints(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 dark:bg-[#0D1117] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white font-bold"
              />
            </div>
          </div>
        </Card>

        {/* Branding & Maintenance */}
        <Card className="p-6 space-y-4 border-slate-200 dark:border-[#2A323D] bg-white dark:bg-[#151B23]">
          <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-[#2A323D] pb-3">Branding & Operational Status</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Club Display Name</label>
              <input
                type="text"
                value={clubName}
                onChange={(e) => setClubName(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-[#0D1117] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Primary Helpdesk Email</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-[#0D1117] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-[#2A323D] flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Maintenance Mode</h4>
              <p className="text-[11px] text-slate-600 dark:text-[#A8B0BB]">Temporarily restrict public access to maintenance landing page.</p>
            </div>

            <Button
              type="button"
              variant={maintenanceMode ? 'destructive' : 'outline'}
              size="sm"
              onClick={() => {
                setMaintenanceMode(!maintenanceMode);
                toast.info(`Maintenance Mode ${!maintenanceMode ? 'Enabled' : 'Disabled'}`);
              }}
            >
              {maintenanceMode ? 'Disable Maintenance' : 'Enable Maintenance'}
            </Button>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" variant="fluent" size="lg" isLoading={isSaving}>
            <Save className="w-4 h-4" /> Save System Settings
          </Button>
        </div>
      </form>
    </div>
  );
}
