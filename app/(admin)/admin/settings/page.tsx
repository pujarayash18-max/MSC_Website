'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Settings, Save, Database, Loader2, RefreshCw, AlertTriangle, ShieldCheck, Share2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

async function fetchSettings() {
  const res = await fetch('/api/settings', {
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
    },
  });
  if (!res.ok) return null;
  const json = await res.json();
  return json.data?.settings || null;
}

export default function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const [clubName, setClubName] = useState('Microsoft Campus Club - Marwadi University');
  const [contactEmail, setContactEmail] = useState('mcc@marwadiuniversity.ac.in');
  const [firstPoints, setFirstPoints] = useState(100);
  const [secondPoints, setSecondPoints] = useState(80);
  const [thirdPoints, setThirdPoints] = useState(50);
  const [participantPoints, setParticipantPoints] = useState(20);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // Social Links
  const [whatsappUrl, setWhatsappUrl] = useState('');
  const [teamsUrl, setTeamsUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');

  const { data: dbSettings, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['admin-global-settings'],
    queryFn: fetchSettings,
  });

  useEffect(() => {
    if (dbSettings) {
      if (dbSettings.clubName) setClubName(dbSettings.clubName);
      if (dbSettings.contactEmail) setContactEmail(dbSettings.contactEmail);
      if (dbSettings.maintenanceMode !== undefined) setMaintenanceMode(Boolean(dbSettings.maintenanceMode));

      const dp = dbSettings.defaultPoints || {};
      if (dp.firstPlace !== undefined) setFirstPoints(Number(dp.firstPlace));
      if (dp.secondPlace !== undefined) setSecondPoints(Number(dp.secondPlace));
      if (dp.thirdPlace !== undefined) setThirdPoints(Number(dp.thirdPlace));
      if (dp.participant !== undefined) setParticipantPoints(Number(dp.participant));

      const sl = dbSettings.socialLinks || {} as any;
      if (sl.whatsapp) setWhatsappUrl(sl.whatsapp);
      if (sl.teams) setTeamsUrl(sl.teams);
      if (sl.linkedin) setLinkedinUrl(sl.linkedin);
      if (sl.github) setGithubUrl(sl.github);
      if (sl.instagram) setInstagramUrl(sl.instagram);
      if (sl.youtube) setYoutubeUrl(sl.youtube);
    }
  }, [dbSettings]);

  const saveSettingsMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        clubName,
        contactEmail,
        defaultPoints: {
          firstPlace: firstPoints,
          secondPlace: secondPoints,
          thirdPlace: thirdPoints,
          participant: participantPoints,
        },
        maintenanceMode,
        socialLinks: {
          whatsapp: whatsappUrl,
          teams: teamsUrl,
          linkedin: linkedinUrl,
          github: githubUrl,
          instagram: instagramUrl,
          youtube: youtubeUrl,
        },
      };

      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to save settings');
      }
      return json.data?.settings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-global-settings'] });
      toast.success('Global System Settings saved live in database!', {
        description: 'Gamification point allocations and Maintenance Mode updated live across platform.',
      });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to save system settings.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettingsMutation.mutate();
  };

  if (isLoading && !dbSettings) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#0078D4] dark:text-[#00A4EF]" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="w-7 h-7 text-[#0078D4] dark:text-[#00A4EF]" /> Global System Settings
          </h1>
          <p className="text-sm text-slate-600 dark:text-[#A8B0BB] mt-1">
            Configure default points allocation, club branding, email templates, and maintenance mode.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isRefetching}
          className="text-xs gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin' : ''}`} /> Refresh Settings
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Points Configuration Engine */}
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
                className="w-full p-2.5 bg-slate-50 dark:bg-[#0D1117] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-[#00A4EF] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">2nd Place Points</label>
              <input
                type="number"
                value={secondPoints}
                onChange={(e) => setSecondPoints(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 dark:bg-[#0D1117] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-[#00A4EF] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">3rd Place Points</label>
              <input
                type="number"
                value={thirdPoints}
                onChange={(e) => setThirdPoints(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 dark:bg-[#0D1117] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-[#00A4EF] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Participant Points</label>
              <input
                type="number"
                value={participantPoints}
                onChange={(e) => setParticipantPoints(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 dark:bg-[#0D1117] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-[#00A4EF] focus:outline-none"
              />
            </div>
          </div>
        </Card>

        {/* Branding & Maintenance Mode */}
        <Card className="p-6 space-y-4 border-slate-200 dark:border-[#2A323D] bg-white dark:bg-[#151B23]">
          <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-[#2A323D] pb-3 flex items-center justify-between">
            <span>Branding &amp; Operational Status</span>
            {maintenanceMode && (
              <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Maintenance Mode Active
              </span>
            )}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Club Display Name</label>
              <input
                type="text"
                value={clubName}
                onChange={(e) => setClubName(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-[#0D1117] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A4EF] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Primary Helpdesk Email</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-[#0D1117] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A4EF] focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-[#2A323D] flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                {maintenanceMode ? (
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                )}
                Maintenance Mode Lockdown
              </h4>
              <p className="text-[11px] text-slate-600 dark:text-[#A8B0BB]">
                Temporarily restrict public access to maintenance page while allowing admins to manage the site.
              </p>
            </div>

            <Button
              type="button"
              variant={maintenanceMode ? 'destructive' : 'outline'}
              size="sm"
              onClick={() => {
                const nextState = !maintenanceMode;
                setMaintenanceMode(nextState);
                toast.info(`Maintenance Mode toggled ${nextState ? 'ON' : 'OFF'}. Click Save below to apply.`);
              }}
            >
              {maintenanceMode ? 'Disable Maintenance' : 'Enable Maintenance'}
            </Button>
          </div>
        </Card>

        {/* Social Media / Community Links */}
        <Card className="p-6 space-y-4 border-slate-200 dark:border-[#2A323D] bg-white dark:bg-[#151B23]">
          <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-[#2A323D] pb-3 flex items-center gap-2">
            <Share2 className="w-4 h-4 text-sky-500" /> Community Social Links
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-[#A8B0BB]">
            These links are displayed in the &quot;Join Community&quot; popup on the homepage.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">WhatsApp Community URL</label>
              <input
                type="url"
                value={whatsappUrl}
                onChange={(e) => setWhatsappUrl(e.target.value)}
                placeholder="https://whatsapp.com/channel/..."
                className="w-full p-2.5 bg-slate-50 dark:bg-[#0D1117] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A4EF] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Microsoft Teams URL</label>
              <input
                type="url"
                value={teamsUrl}
                onChange={(e) => setTeamsUrl(e.target.value)}
                placeholder="https://teams.microsoft.com/..."
                className="w-full p-2.5 bg-slate-50 dark:bg-[#0D1117] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A4EF] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">LinkedIn Organization URL</label>
              <input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/company/..."
                className="w-full p-2.5 bg-slate-50 dark:bg-[#0D1117] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A4EF] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">GitHub Organization URL</label>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/..."
                className="w-full p-2.5 bg-slate-50 dark:bg-[#0D1117] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A4EF] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Instagram Page URL</label>
              <input
                type="url"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                placeholder="https://instagram.com/..."
                className="w-full p-2.5 bg-slate-50 dark:bg-[#0D1117] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A4EF] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">YouTube Channel URL</label>
              <input
                type="url"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://youtube.com/@..."
                className="w-full p-2.5 bg-slate-50 dark:bg-[#0D1117] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A4EF] focus:outline-none"
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="fluent"
            size="lg"
            disabled={saveSettingsMutation.isPending}
            className="gap-2 font-bold shadow-lg shadow-sky-500/20"
          >
            {saveSettingsMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save System Settings
          </Button>
        </div>
      </form>
    </div>
  );
}
