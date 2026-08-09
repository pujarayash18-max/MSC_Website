'use client';
import { HTMLAttributes } from 'react';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'purple' | 'outline';
  size?: 'sm' | 'md';
}

export function Badge({ className = '', variant = 'default', size = 'md', children, ...props }: BadgeProps) {
  const base = 'inline-flex items-center font-semibold rounded-full border transition-colors';

  const variants = {
    default: 'bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    primary: 'bg-[#0078D4]/15 dark:bg-[#0078D4]/20 text-[#0078D4] dark:text-[#00A4EF] border-[#0078D4]/40 font-bold',
    success: 'bg-[#7FBA00]/15 dark:bg-[#7FBA00]/20 text-[#4c7000] dark:text-[#7FBA00] border-[#7FBA00]/40 font-bold',
    warning: 'bg-[#FFB900]/15 dark:bg-[#FFB900]/20 text-[#b38200] dark:text-[#FFB900] border-[#FFB900]/40 font-bold',
    danger: 'bg-[#F25022]/15 dark:bg-[#F25022]/20 text-[#c4360e] dark:text-[#F25022] border-[#F25022]/40 font-bold',
    purple: 'bg-[#5C2D91]/15 dark:bg-[#5C2D91]/25 text-[#5C2D91] dark:text-[#b181ed] border-[#5C2D91]/40 font-bold',
    outline: 'bg-transparent text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-xs'
  };

  return (
    <span className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </span>
  );
}
