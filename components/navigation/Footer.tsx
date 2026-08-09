'use client';
import Link from 'next/link';
import { ExternalLink, Mail, Phone, MapPin } from 'lucide-react';
import { GithubIcon, LinkedinIcon, MicrosoftFourSquareIcon } from '@/components/icons';

export function Footer() {
  return (
    <footer className="bg-slate-100 dark:bg-[#0B0F14] border-t border-slate-200 dark:border-[#2A323D] pt-16 pb-12 text-slate-600 dark:text-[#A8B0BB] text-sm relative overflow-hidden">
      {/* Microsoft 4-Color Thin Gradient Line */}
      <div className="absolute top-0 left-0 right-0 h-1 ms-gradient-bar" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-200 dark:border-[#2A323D]">
          {/* Col 1: About */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white dark:bg-[#151B23] border border-slate-200 dark:border-[#2A323D] shadow-sm">
                <MicrosoftFourSquareIcon className="w-6 h-6" />
              </div>
              <span className="font-extrabold text-lg text-slate-900 dark:text-[#F5F7FA]">
                Microsoft <span className="text-[#0078D4] dark:text-[#00A4EF]">Campus Club</span>
              </span>
            </Link>
            <p className="text-slate-600 dark:text-[#A8B0BB] text-xs leading-relaxed max-w-sm">
              The official digital student ecosystem for Microsoft Campus Club (MCC) at Marwadi University, Rajkot. Driving technical excellence, workshops, hackathons, and community innovation.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-white dark:bg-[#151B23] border border-slate-200 dark:border-[#2A323D] hover:text-slate-900 dark:hover:text-white hover:border-[#00A4EF]/50 transition-colors shadow-sm"
              >
                <GithubIcon className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-white dark:bg-[#151B23] border border-slate-200 dark:border-[#2A323D] hover:text-slate-900 dark:hover:text-white hover:border-[#00A4EF]/50 transition-colors shadow-sm"
              >
                <LinkedinIcon className="w-4 h-4" />
              </a>
              <a
                href="https://learn.microsoft.com"
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-xl bg-white dark:bg-[#151B23] border border-slate-200 dark:border-[#2A323D] hover:text-[#0078D4] dark:hover:text-[#00A4EF] transition-colors flex items-center gap-1.5 text-xs font-semibold shadow-sm"
              >
                <span>MS Learn</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#00A4EF]" />
              </a>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-[#F5F7FA] text-xs uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link href="/about" className="hover:text-[#0078D4] dark:hover:text-[#00A4EF] font-semibold text-sky-400 transition-colors">Vision & Mission</Link></li>
              <li><Link href="/events" className="hover:text-[#0078D4] dark:hover:text-[#00A4EF] transition-colors">Events & Workshops</Link></li>
              <li><Link href="/resources" className="hover:text-[#0078D4] dark:hover:text-[#00A4EF] transition-colors">Resources & Libraries</Link></li>
              <li><Link href="/leaderboard" className="hover:text-[#0078D4] dark:hover:text-[#00A4EF] transition-colors">Leaderboard</Link></li>
              <li><Link href="/speakers" className="hover:text-[#0078D4] dark:hover:text-[#00A4EF] transition-colors">Speakers</Link></li>
              <li><Link href="/team" className="hover:text-[#0078D4] dark:hover:text-[#00A4EF] transition-colors">Core Team</Link></li>
              <li><Link href="/gallery" className="hover:text-[#0078D4] dark:hover:text-[#00A4EF] transition-colors">Gallery</Link></li>
              <li><Link href="/blog" className="hover:text-[#0078D4] dark:hover:text-[#00A4EF] transition-colors">Technical Blog</Link></li>
            </ul>
          </div>

          {/* Col 3: Student Portal */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-[#F5F7FA] text-xs uppercase tracking-wider mb-4">Student Hub</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link href="/dashboard" className="hover:text-[#0078D4] dark:hover:text-[#00A4EF] transition-colors">Student Dashboard</Link></li>
              <li><Link href="/dashboard/certificates" className="hover:text-[#0078D4] dark:hover:text-[#00A4EF] transition-colors">My Certificates</Link></li>
              <li><Link href="/verify-certificate" className="hover:text-[#0078D4] dark:hover:text-[#00A4EF] transition-colors">Verify Certificate</Link></li>
              <li><Link href="/dashboard/resources" className="hover:text-[#0078D4] dark:hover:text-[#00A4EF] transition-colors">Event Resources</Link></li>
              <li><Link href="/join-us" className="hover:text-[#0078D4] dark:hover:text-[#00A4EF] transition-colors">Join MCC Team</Link></li>
            </ul>
          </div>

          {/* Col 4: Faculty & Campus */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-[#F5F7FA] text-xs uppercase tracking-wider mb-4">Faculty Contact</h4>
            <div className="space-y-2.5 text-xs text-slate-600 dark:text-[#A8B0BB]">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#00A4EF] shrink-0 mt-0.5" />
                <span>Marwadi University, Rajkot-Morbi Highway, Gujarat - 360003</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#00A4EF] shrink-0" />
                <span>mcc@marwadiuniversity.ac.in</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#00A4EF] shrink-0" />
                <span>+91 (0281) 7123456</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} Microsoft Campus Club (MCC) — Marwadi University. All rights reserved.</p>
          <div className="flex items-center gap-6 text-slate-500">
            <Link href="/privacy" className="hover:text-slate-800 dark:hover:text-slate-300 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-slate-800 dark:hover:text-slate-300 transition-colors">Terms of Service</Link>
            <Link href="/contact" className="hover:text-slate-800 dark:hover:text-slate-300 transition-colors">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
