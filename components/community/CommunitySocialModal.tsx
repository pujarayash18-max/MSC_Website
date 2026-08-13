'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, ExternalLink, Sparkles, Check, Copy, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';

interface CommunitySocialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

async function fetchSocialLinks() {
  try {
    const res = await fetch('/api/settings', { cache: 'no-store' });
    if (!res.ok) return {};
    const json = await res.json();
    return (json.data?.settings?.socialLinks || {}) as Record<string, string>;
  } catch {
    return {};
  }
}

const SOCIAL_LINK_DEFS = [
  {
    key: 'whatsapp',
    name: 'WhatsApp Community',
    description: 'Official student lounge for real-time announcements, workshop links, and study groups.',
    fallbackUrl: 'https://whatsapp.com/channel/0029Va9Xxxx',
    color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400',
    iconBg: 'bg-emerald-500/20 text-emerald-400',
    badge: 'Primary Channel',
  },
  {
    key: 'teams',
    name: 'Microsoft Teams',
    description: 'Join live tech talks, Azure hands-on labs, and Student Ambassador roadmap webinars.',
    fallbackUrl: 'https://teams.microsoft.com',
    color: 'from-blue-500/20 to-indigo-500/10 border-blue-500/30 text-blue-400',
    iconBg: 'bg-blue-500/20 text-blue-400',
    badge: 'Live Events',
  },
  {
    key: 'linkedin',
    name: 'LinkedIn Organization',
    description: 'Connect with MLSA leads, alumni, and share your event completion certificates.',
    fallbackUrl: 'https://linkedin.com/company/microsoft-campus-club-mu',
    color: 'from-sky-500/20 to-cyan-500/10 border-sky-500/30 text-sky-400',
    iconBg: 'bg-sky-500/20 text-sky-400',
    badge: 'Professional',
  },
  {
    key: 'github',
    name: 'GitHub Organization',
    description: 'Contribute to club web projects, workshop source code, and student hackathon repos.',
    fallbackUrl: 'https://github.com/microsoft-campus-club-mu',
    color: 'from-slate-700/40 to-slate-800/20 border-slate-700/50 text-slate-200',
    iconBg: 'bg-slate-700/50 text-slate-200',
    badge: 'Code & Repos',
  },
  {
    key: 'instagram',
    name: 'Instagram Page',
    description: 'Catch behind-the-scenes, workshop photo galleries, hackathon winners, and reels.',
    fallbackUrl: 'https://instagram.com/mcc_marwadi',
    color: 'from-pink-500/20 to-purple-500/10 border-pink-500/30 text-pink-400',
    iconBg: 'bg-pink-500/20 text-pink-400',
    badge: 'Photos & Updates',
  },
  {
    key: 'youtube',
    name: 'YouTube Channel',
    description: 'Watch past session recordings, Azure setup tutorials, and project walkthroughs.',
    fallbackUrl: 'https://youtube.com/@microsoftcampusclubmu',
    color: 'from-red-500/20 to-rose-500/10 border-red-500/30 text-red-400',
    iconBg: 'bg-red-500/20 text-red-400',
    badge: 'Video Tutorials',
  },
];

export function CommunitySocialModal({ isOpen, onClose }: CommunitySocialModalProps) {
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);

  const { data: socialLinks = {}, isLoading } = useQuery({
    queryKey: ['community-social-links'],
    queryFn: fetchSocialLinks,
    enabled: isOpen,
  });

  const copyToClipboard = (url: string, index: number) => {
    navigator.clipboard.writeText(url);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-slate-900/95 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 p-6 sm:p-8"
          >
            {/* Header */}
            <div className="flex items-start justify-between pb-6 border-b border-slate-800">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-sky-400" /> Official Community Hub
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight pt-1">
                  Connect with Microsoft Campus Club
                </h2>
                <p className="text-xs text-slate-400">
                  Join our official communication channels, student groups, and social platforms at Marwadi University.
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Social Cards Grid */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-sky-400" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-6 max-h-[60vh] overflow-y-auto pr-1">
                {SOCIAL_LINK_DEFS.map((link, idx) => {
                  const url = (socialLinks as any)[link.key] || link.fallbackUrl;
                  return (
                    <div
                      key={link.key}
                      className={`p-4 rounded-2xl bg-gradient-to-br ${link.color} border transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between space-y-3`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${link.iconBg}`}>
                            {link.badge}
                          </span>
                          <button
                            onClick={() => copyToClipboard(url, idx)}
                            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
                            title="Copy Link"
                          >
                            {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                            {link.name}
                          </h4>
                          <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">{link.description}</p>
                        </div>
                      </div>

                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-xs font-semibold text-white border border-slate-700/50 hover:border-slate-600 transition-all group"
                      >
                        Join / Open Link <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </a>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Footer Notice */}
            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-sky-400" /> For official recruitment, use the <a href="/join-us" className="text-sky-400 hover:underline font-semibold ml-1">Leadership Application Form</a>
              </span>
              <Button variant="outline" size="sm" onClick={onClose} className="border-slate-700 text-slate-300">
                Close
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
