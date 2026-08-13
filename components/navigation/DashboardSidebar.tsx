'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileCheck,
  FileText,
  FolderDown,
  Award,
  QrCode,
  Zap,
  Trophy,
  MessageSquare,
  Bell,
  User,
  UserCheck,
  Settings,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { isAdminRole } from '@/lib/constants/roles';

const SIDEBAR_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'My Applications', href: '/dashboard/applications', icon: UserCheck },
  { label: 'My Registrations', href: '/dashboard/registrations', icon: FileCheck },
  { label: 'My Articles & Blogs', href: '/dashboard/blogs', icon: FileText },
  { label: 'Resources', href: '/dashboard/resources', icon: FolderDown },
  { label: 'Certificates', href: '/dashboard/certificates', icon: Award },
  { label: 'Attendance', href: '/dashboard/attendance', icon: QrCode },
  { label: 'Achievements', href: '/dashboard/achievements', icon: Zap },
  { label: 'Points Ledger', href: '/dashboard/points', icon: Trophy },
  { label: 'Leaderboard', href: '/dashboard/leaderboard', icon: Trophy },
  { label: 'Feedback', href: '/dashboard/feedback', icon: MessageSquare },
  { label: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  { label: 'Profile', href: '/dashboard/profile', icon: User },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings }
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { role } = useAuth();

  return (
    <aside className="w-64 bg-white dark:bg-[#151B23] border-r border-slate-200 dark:border-[#2A323D] flex flex-col justify-between p-4 h-full shrink-0">
      <div className="space-y-6">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-[#A8B0BB] px-3 block mb-2">
            Student Navigation
          </span>
          <nav className="space-y-1">
            {SIDEBAR_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#0078D4] dark:bg-[#00A4EF] text-white shadow-md shadow-sky-500/25'
                      : 'text-slate-700 dark:text-[#A8B0BB] hover:bg-slate-100 dark:hover:bg-[#1B222C] hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {isAdminRole(role) && (
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-500 px-3 block mb-2">
              Admin Access
            </span>
            <Link
              href="/admin"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-all"
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Admin Console</span>
            </Link>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-slate-200 dark:border-[#2A323D] text-[10px] text-slate-500 dark:text-slate-400 px-3">
        Microsoft Campus Club v1.0
      </div>
    </aside>
  );
}
