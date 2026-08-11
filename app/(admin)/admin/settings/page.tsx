'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Settings, Save, Database, Share2, MessageCircle } from 'lucide-react';
import { InstagramIcon, LinkedinIcon } from '@/components/icons';
import { dynamicDb } from '@/lib/services/dataService';

export default function AdminSettingsPage() {
  const [clubName, setClubName] = useState('Microsoft Campus Club - Marwadi University');
  const [contactEmail, setContactEmail] = useState('mcc@marwadiuniversity.ac.in');
  const [firstPoints, setFirstPoints] = useState(100);
  const [secondPoints, setSecondPoints] = useState(80);
  const [thirdPoints, setThirdPoints] = useState(50);
  const [participantPoints, setParticipantPoints] = useState(20);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Social Links State
  const [whatsappLink, setWhatsappLink] = useState('https://chat.whatsapp.com/mcc-community-official');
  const [instagramLink, setInstagramLink] = useState('https://instagram.com/microsoftstudentcommunity');
  const [linkedinLink, setLinkedinLink] = useState('https://linkedin.com/company/microsoft-student-community');

  useEffect(() => {
    const links = dynamicDb.getSocialLinks();
    setWhatsappLink(links.whatsapp);
    setInstagramLink(links.instagram);
    setLinkedinLink(links.linkedin);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      dynamicDb.saveSocialLinks({
        whatsapp: whatsappLink.trim(),
        instagram: instagramLink.trim(),
        linkedin: linkedinLink.trim()
      });
      setIsSaving(false);
      toast.success('Global system settings and Social Community Popup links saved!');
    }, 400);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-7 h-7 text-[#0078D4] dark:text-[#00A4EF]" /> Global System & Social Settings
        </h1>
        <p className="text-sm text-slate-600 dark:text-[#A8B0BB] mt-1">
          Configure default points allocation, social community popup URLs, club branding, and maintenance status.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Social Community Popup Link Manager */}
        <Card className="p-6 space-y-4 border-sky-500/30 bg-white dark:bg-[#151B23]">
          <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-[#2A323D] pb-3 flex items-center gap-2">
            <Share2 className="w-4 h-4 text-[#00A4EF]" /> Social Community Popup Links (User Modal)
          </h3>
          <p className="text-xs text-slate-500 dark:text-[#A8B0BB]">
            Admins can configure the official links shown in the Social Community Popup for all visiting members.
          </p>

          <div className="space-y-4 text-xs">
            <div>
              <label className="text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1.5 mb-1">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-500" /> WhatsApp Community Link
              </label>
              <input
                type="url"
                required
                value={whatsappLink}
                onChange={(e) => setWhatsappLink(e.target.value)}
                placeholder="https://chat.whatsapp.com/..."
                className="w-full p-2.5 bg-slate-50 dark:bg-[#0D1117] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1.5 mb-1">
                <InstagramIcon className="w-3.5 h-3.5 text-pink-500" /> Instagram Handle / Profile URL
              </label>
              <input
                type="url"
                required
                value={instagramLink}
                onChange={(e) => setInstagramLink(e.target.value)}
                placeholder="https://instagram.com/..."
                className="w-full p-2.5 bg-slate-50 dark:bg-[#0D1117] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1.5 mb-1">
                <LinkedinIcon className="w-3.5 h-3.5 text-sky-500" /> LinkedIn Company / Community URL
              </label>
              <input
                type="url"
                required
                value={linkedinLink}
                onChange={(e) => setLinkedinLink(e.target.value)}
                placeholder="https://linkedin.com/company/..."
                className="w-full p-2.5 bg-slate-50 dark:bg-[#0D1117] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white font-mono"
              />
            </div>
          </div>
        </Card>

        {/* Points Configuration */}
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

