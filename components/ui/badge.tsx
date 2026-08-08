'use client';
import { HTMLAttributes } from 'react';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'purple' | 'outline';
  size?: 'sm' | 'md';
}

export function Badge({ className = '', variant = 'default', size = 'md', children, ...props }: BadgeProps) {
  const base = 'inline-flex items-center font-medium rounded-full border transition-colors';

  const variants = {
    default: 'bg-slate-800/80 text-slate-300 border-slate-700',
    primary: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    danger: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    outline: 'bg-transparent text-slate-300 border-slate-700'
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
