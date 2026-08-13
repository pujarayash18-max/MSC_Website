'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  FileSpreadsheet,
  Users,
  QrCode,
  FolderDown,
  Award,
  Trophy,
  FileText,
  Image,
  UserCheck,
  UserPlus,
  Mic,
  BellRing,
  MessageSquare,
  Ticket,
  Send,
  BarChart3,
  ShieldCheck,
  History,
  Settings,
} from 'lucide-react';
import { usePermission } from '@/hooks/usePermission';
import { SystemModule } from '@/types';

const ADMIN_SIDEBAR_ITEMS: { label: string; href: string; icon: any; module: SystemModule }[] = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard, module: 'Dashboard' },
  { label: 'Events Core', href: '/admin/events', icon: Calendar, module: 'Events' },
  { label: 'Form Builder', href: '/admin/forms', icon: FileSpreadsheet, module: 'Registration Forms' },
  { label: 'Registrations', href: '/admin/registrations', icon: Users, module: 'Registrations' },
  { label: 'QR Scanner', href: '/admin/attendance/scanner', icon: QrCode, module: 'Attendance' },
  { label: 'Live Resources', href: '/admin/resources', icon: FolderDown, module: 'Event Resources' },
  { label: 'Certificates', href: '/admin/certificates/templates', icon: Award, module: 'Certificates' },
  { label: 'Winner Cascade', href: '/admin/winners', icon: Trophy, module: 'Winners' },
  { label: 'Leaderboard Config', href: '/admin/leaderboard', icon: Trophy, module: 'Leaderboard' },
  { label: 'Blogs Manager', href: '/admin/blogs', icon: FileText, module: 'Blogs' },
  { label: 'Gallery Manager', href: '/admin/gallery', icon: Image, module: 'Gallery' },
  { label: 'Team Manager', href: '/admin/team', icon: UserCheck, module: 'Team Profiles' },
  { label: 'Recruitment & Roles', href: '/admin/recruitment', icon: UserPlus, module: 'Team Profiles' },
  { label: 'Speaker Manager', href: '/admin/speakers', icon: Mic, module: 'Speaker Profiles' },
  { label: 'Notice Board', href: '/admin/notices', icon: BellRing, module: 'Notices' },
  { label: 'Feedback Manager', href: '/admin/feedback', icon: MessageSquare, module: 'Contact Tickets' },
  { label: 'Support Tickets', href: '/admin/tickets', icon: Ticket, module: 'Contact Tickets' },
  { label: 'Push Notifications', href: '/admin/notifications', icon: Send, module: 'Notices' },
  { label: 'Reports & Analytics', href: '/admin/reports', icon: BarChart3, module: 'Reports' },
  { label: 'User Roles & Access', href: '/admin/users', icon: Users, module: 'RBAC' },
  { label: 'RBAC Permission Engine', href: '/admin/rbac', icon: ShieldCheck, module: 'RBAC' },
  { label: 'Audit Logs', href: '/admin/audit-logs', icon: History, module: 'Audit Logs' },
  { label: 'Global Settings', href: '/admin/settings', icon: Settings, module: 'Settings' },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { hasPermission } = usePermission();

  const visibleItems = ADMIN_SIDEBAR_ITEMS.filter((item) => {
    return hasPermission(item.module, 'View');
  });

  return (
    <aside className="w-64 bg-white dark:bg-[#151B23] border-r border-slate-200 dark:border-[#2A323D] flex flex-col justify-between p-4 h-full shrink-0 overflow-y-auto">
      <div className="space-y-6">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0078D4] dark:text-[#00A4EF] px-3 block mb-2">
            Admin Management Console
          </span>
          <nav className="space-y-1">
            {visibleItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#0078D4] dark:bg-[#00A4EF] text-white shadow-md shadow-sky-500/25'
                      : 'text-slate-700 dark:text-[#A8B0BB] hover:bg-slate-100 dark:hover:bg-[#1B222C] hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 dark:text-[#A8B0BB]'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </aside>
  );
}
