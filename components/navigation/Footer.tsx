'use client';
import Link from 'next/link';
import { Sparkles, ExternalLink, Mail, Phone, MapPin } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from '@/components/icons';

export function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 pt-16 pb-12 text-slate-400 text-sm relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800/60">
          {/* Col 1: About */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/25">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg text-white">
                Microsoft <span className="text-sky-400">Campus Club</span>
              </span>
            </Link>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              The official digital student ecosystem for Microsoft Campus Club (MCC) at Marwadi University, Rajkot. Driving technical excellence, workshops, hackathons, and community innovation.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:text-white hover:border-sky-500/50 transition-colors"
              >
                <GithubIcon className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:text-white hover:border-sky-500/50 transition-colors"
              >
                <LinkedinIcon className="w-4 h-4" />
              </a>
              <a
                href="https://learn.microsoft.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:text-sky-400 hover:border-sky-500/50 transition-colors flex items-center gap-1 text-xs font-semibold"
              >
                MS Learn <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link href="/events" className="hover:text-sky-400 transition-colors">Events & Workshops</Link></li>
              <li><Link href="/leaderboard" className="hover:text-sky-400 transition-colors">Leaderboard</Link></li>
              <li><Link href="/speakers" className="hover:text-sky-400 transition-colors">Speakers</Link></li>
              <li><Link href="/team" className="hover:text-sky-400 transition-colors">Core Team</Link></li>
              <li><Link href="/gallery" className="hover:text-sky-400 transition-colors">Gallery</Link></li>
              <li><Link href="/blog" className="hover:text-sky-400 transition-colors">Technical Blog</Link></li>
            </ul>
          </div>

          {/* Col 3: Student Portal */}
          <div>
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-4">Student Hub</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link href="/dashboard" className="hover:text-sky-400 transition-colors">Student Dashboard</Link></li>
              <li><Link href="/dashboard/certificates" className="hover:text-sky-400 transition-colors">My Certificates</Link></li>
              <li><Link href="/verify-certificate" className="hover:text-sky-400 transition-colors">Verify Certificate</Link></li>
              <li><Link href="/dashboard/resources" className="hover:text-sky-400 transition-colors">Event Resources</Link></li>
              <li><Link href="/join-us" className="hover:text-sky-400 transition-colors">Join MCC Team</Link></li>
            </ul>
          </div>

          {/* Col 4: Faculty & Campus */}
          <div>
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-4">Faculty Contact</h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span>Marwadi University, Rajkot-Morbi Highway, Gujarat - 360003</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                <span>mcc@marwadiuniversity.ac.in</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-sky-400 shrink-0" />
                <span>+91 (0281) 7123456</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} Microsoft Campus Club (MCC) - Marwadi University. All rights reserved.</p>
          <div className="flex items-center gap-6 text-slate-500">
            <Link href="/privacy" className="hover:text-slate-400 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-slate-400 transition-colors">Terms of Service</Link>
            <Link href="/contact" className="hover:text-slate-400 transition-colors">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
