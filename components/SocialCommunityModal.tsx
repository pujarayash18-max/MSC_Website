'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, X, Sparkles } from 'lucide-react';
import { InstagramIcon, LinkedinIcon } from '@/components/icons';
import { dynamicDb } from '@/lib/services/dataService';

export function SocialCommunityModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [links, setLinks] = useState({
    whatsapp: 'https://chat.whatsapp.com/mcc-community-official',
    instagram: 'https://instagram.com/microsoftstudentcommunity',
    linkedin: 'https://linkedin.com/company/microsoft-student-community'
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDismissed = localStorage.getItem('mcc_social_popup_dismissed');
      if (isDismissed === 'true') return;

      const loadedLinks = dynamicDb.getSocialLinks();
      setLinks(loadedLinks);

      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    if (dontShowAgain && typeof window !== 'undefined') {
      localStorage.setItem('mcc_social_popup_dismissed', 'true');
    }
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-6 duration-300 max-w-sm w-full p-2">
      <Card className="p-5 shadow-2xl border border-sky-500/30 bg-slate-900/95 dark:bg-[#151B23]/95 backdrop-blur-md text-white relative space-y-4 rounded-2xl">
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          aria-label="Close social modal"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="space-y-1 pr-6">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#00A4EF] flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Microsoft Student Community
          </span>
          <h3 className="text-base font-bold text-white">Join Our Active Developer Hubs!</h3>
          <p className="text-xs text-slate-300">
            Connect with student developers, get event announcements, and join hackathon teams.
          </p>
        </div>

        <div className="space-y-2 pt-1">
          <a
            href={links.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-semibold text-xs transition-all group"
          >
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform">
              <MessageCircle className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="leading-tight font-bold">WhatsApp Community</p>
              <p className="text-[10px] text-emerald-300/80">Live event updates & study groups</p>
            </div>
          </a>

          <a
            href={links.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-2.5 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/30 text-pink-400 font-semibold text-xs transition-all group"
          >
            <div className="p-1.5 rounded-lg bg-pink-500/20 text-pink-400 group-hover:scale-110 transition-transform">
              <InstagramIcon className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="leading-tight font-bold">Instagram Community</p>
              <p className="text-[10px] text-pink-300/80">Campus photos, reels & highlights</p>
            </div>
          </a>

          <a
            href={links.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-2.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-400 font-semibold text-xs transition-all group"
          >
            <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400 group-hover:scale-110 transition-transform">
              <LinkedinIcon className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="leading-tight font-bold">LinkedIn Network</p>
              <p className="text-[10px] text-sky-300/80">Networking & career opportunities</p>
            </div>
          </a>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] text-slate-400">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="w-3.5 h-3.5 accent-[#00A4EF] rounded"
            />
            <span>Don't show again</span>
          </label>

          <Button variant="ghost" size="sm" onClick={handleClose} className="text-xs h-7 px-2 text-slate-300 hover:text-white">
            Dismiss
          </Button>
        </div>
      </Card>
    </div>
  );
}
