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
  showLink = true,
  className = ''
}: OrgBadgeProps) {
  const isSmall = size === 'sm';

  const content = (
    <div className={`inline-flex items-center gap-2 sm:gap-2.5 ${className}`}>
      {/* 1. MSC Logo — square 1:1 image
             We fix its height and let width be auto (square ≈ h × h),
             then set a reasonable max-w so the logo+text is legible */}
      <div className="shrink-0 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white shadow-sm flex items-center justify-center p-1 transition-transform hover:scale-[1.02]">
        <Image
          src="/logos/msc-logo.png"
          alt="Microsoft Student Community Logo"
          width={200}
          height={200}
          unoptimized
          className={isSmall
            ? 'object-contain h-8 w-8'
            : 'object-contain h-10 w-10'}
          priority
        />
      </div>

      {/* Separator */}
      <span className="text-slate-300 dark:text-slate-600 font-light text-lg select-none leading-none shrink-0">×</span>

      {/* 2. Marwadi University CE Dept Logo — wide landscape image (aspect ~4:1)
             Always use a white bg so its light-blue background stays consistent
             in both light and dark themes */}
      <div className="shrink-0 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white shadow-sm flex items-center justify-center px-2 py-1 transition-transform hover:scale-[1.02]">
        <Image
          src="/logos/marwadi-university.png"
          alt="Marwadi University — Department of Computer Engineering"
          width={320}
          height={80}
          unoptimized
          className={isSmall
            ? 'object-contain h-7 w-auto max-w-[130px]'
            : 'object-contain h-9 w-auto max-w-[160px]'}
          priority
        />
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
