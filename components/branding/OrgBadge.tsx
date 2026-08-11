'use client';

import Image from 'next/image';
import Link from 'next/link';

interface OrgBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'navbar' | 'footer' | 'standalone';
  showLink?: boolean;
  className?: string;
}

export function OrgBadge({
  size = 'md',
  variant = 'navbar',
  showLink = true,
  className = ''
}: OrgBadgeProps) {
  const isNavbar = variant === 'navbar';
  const isSmall = size === 'sm';

  const content = (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {/* MSC Logo Lockup */}
      <div className="flex items-center gap-2">
        <div className="relative shrink-0 overflow-hidden rounded-xl border border-sky-500/20 bg-white/10 dark:bg-slate-900/40 p-1 shadow-md">
          <Image
            src="/logos/msc-logo.png"
            alt="Microsoft Student Community Logo"
            width={isSmall ? 32 : 40}
            height={isSmall ? 32 : 40}
            className="object-contain"
            priority
          />
        </div>
        {!isSmall && (
          <div className="flex flex-col">
            <span className="text-xs font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              Microsoft Student Community
            </span>
            <span className="text-[10px] font-semibold text-sky-600 dark:text-sky-400 leading-none">
              Marwadi University
            </span>
          </div>
        )}
      </div>

      {/* Separator */}
      <span className="text-slate-300 dark:text-slate-700 font-light text-lg select-none">×</span>

      {/* Marwadi University & Dept of Computer Engineering Logo Lockup */}
      <div className="flex items-center gap-2">
        <div className="relative shrink-0 overflow-hidden rounded-xl border border-teal-500/20 bg-white/10 dark:bg-slate-900/40 p-1 shadow-md">
          <Image
            src="/logos/marwadi-university.png"
            alt="Marwadi University Department of Computer Engineering Logo"
            width={isSmall ? 80 : 120}
            height={isSmall ? 28 : 36}
            className="object-contain h-7 w-auto"
          />
        </div>
        {isNavbar && isSmall && (
          <span className="hidden lg:inline-block text-[10px] font-medium text-slate-500 dark:text-slate-400">
            Dept. of Computer Engineering
          </span>
        )}
      </div>
    </div>
  );

  if (showLink) {
    return (
      <Link href="/" className="hover:opacity-90 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}
