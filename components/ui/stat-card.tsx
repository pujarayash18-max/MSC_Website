'use client';
import { ReactNode } from 'react';
import { Card } from './card';

export interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  accentColor?: 'blue' | 'purple' | 'emerald' | 'amber' | 'rose';
}

export function StatCard({
  title,
  value,
  description,
  icon,
  trend,
  accentColor = 'blue'
}: StatCardProps) {
  const iconGradients = {
    blue: 'from-sky-500/20 to-blue-600/20 text-sky-400 border-sky-500/30',
    purple: 'from-purple-500/20 to-indigo-600/20 text-purple-400 border-purple-500/30',
    emerald: 'from-emerald-500/20 to-teal-600/20 text-emerald-400 border-emerald-500/30',
    amber: 'from-amber-500/20 to-orange-600/20 text-amber-400 border-amber-500/30',
    rose: 'from-rose-500/20 to-red-600/20 text-rose-400 border-rose-500/30'
  };

  return (
    <Card className="p-6 relative overflow-hidden group hover:border-slate-700 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
          <h3 className="text-3xl font-extrabold text-white mt-1 tracking-tight">{value}</h3>
          {description && <p className="text-xs text-slate-400 mt-1">{description}</p>}
          {trend && (
            <div className="flex items-center gap-1 mt-2 text-xs font-medium">
              <span className={trend.isPositive ? 'text-emerald-400' : 'text-rose-400'}>
                {trend.isPositive ? '↑' : '↓'} {trend.value}
              </span>
              <span className="text-slate-500">vs last month</span>
            </div>
          )}
        </div>

        <div className={`p-3 rounded-2xl bg-gradient-to-br border ${iconGradients[accentColor]} transition-transform duration-300 group-hover:scale-110`}>
          {icon}
        </div>
      </div>
    </Card>
  );
}
