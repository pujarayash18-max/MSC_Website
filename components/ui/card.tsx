'use client';
import { HTMLAttributes, forwardRef } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(({ className = '', glass = true, children, ...props }, ref) => {
  const glassStyle = glass
    ? 'bg-slate-900/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 dark:border-slate-800/80 shadow-xl shadow-black/20'
    : 'bg-slate-900 border border-slate-800 shadow-md';

  return (
    <div ref={ref} className={`rounded-2xl transition-all duration-300 ${glassStyle} ${className}`} {...props}>
      {children}
    </div>
  );
});
Card.displayName = 'Card';

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className = '', children, ...props }, ref) => (
    <div ref={ref} className={`p-6 pb-3 ${className}`} {...props}>
      {children}
    </div>
  )
);
CardHeader.displayName = 'CardHeader';

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className = '', children, ...props }, ref) => (
    <h3 ref={ref} className={`text-lg font-bold text-white tracking-tight ${className}`} {...props}>
      {children}
    </h3>
  )
);
CardTitle.displayName = 'CardTitle';

export const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className = '', children, ...props }, ref) => (
    <p ref={ref} className={`text-sm text-slate-400 mt-1 ${className}`} {...props}>
      {children}
    </p>
  )
);
CardDescription.displayName = 'CardDescription';

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className = '', children, ...props }, ref) => (
    <div ref={ref} className={`p-6 pt-3 ${className}`} {...props}>
      {children}
    </div>
  )
);
CardContent.displayName = 'CardContent';

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className = '', children, ...props }, ref) => (
    <div ref={ref} className={`p-6 pt-0 flex items-center ${className}`} {...props}>
      {children}
    </div>
  )
);
CardFooter.displayName = 'CardFooter';
