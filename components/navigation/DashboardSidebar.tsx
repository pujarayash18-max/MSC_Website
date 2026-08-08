'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  LayoutDashboard,
  Calendar,
  FileCheck,
  FolderDown,
  Award,
  QrCode,
  Trophy,
  Zap,
  BarChart2,
  MessageSquare,
  Bell,
  User,
  Settings,
  LogOut,
  Sparkles
} from 'lucide-react';

const DASHBOARD_NAV = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'My Events', href: '/dashboard/events', icon: Calendar },
  { label: 'My Registrations', href: '/dashboard/registrations', icon: FileCheck },
  { label: 'Event Resources', href: '/dashboard/resources', icon: FolderDown },
  { label: 'Certificates', href: '/dashboard/certificates', icon: Award },
  { label: 'Attendance', href: '/dashboard/attendance', icon: QrCode },
  { label: 'Achievements', href: '/dashboard/achievements', icon: Trophy },
  { label: 'Points', href: '/dashboard/points', icon: Zap },
  { label: 'Leaderboard', href: '/dashboard/leaderboard', icon: BarChart2 },
  { label: 'Feedback', href: '/dashboard/feedback', icon: MessageSquare },
  { label: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  { label: 'Profile', href: '/dashboard/profile', icon: User },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings }
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 bg-slate-950/80 backdrop-blur-xl border-r border-slate-800/80 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between">
      <div className="space-y-6">
        {/* User Mini Profile */}
        <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
          <img
            src={user?.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
            alt={user?.fullName}
            className="w-10 h-10 rounded-xl object-cover border border-sky-500/30"
          />
          <div className="overflow-hidden">
            <h4 className="text-xs font-bold text-white truncate">{user?.fullName}</h4>
            <p className="text-[11px] text-sky-400 font-medium truncate">{user?.roleName}</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {DASHBOARD_NAV.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 text-xs font-medium rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-sky-600 text-white font-semibold shadow-lg shadow-sky-600/25'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Logout Action */}
      <div className="pt-4 border-t border-slate-800/80">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-medium rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
