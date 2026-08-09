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
  Mic,
  BellRing,
  MessageSquare,
  Ticket,
  Send,
  BarChart3,
  ShieldCheck,
  History,
  Settings
} from 'lucide-react';

const ADMIN_SIDEBAR_ITEMS = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard },
  { label: 'Events Core', href: '/admin/events', icon: Calendar },
  { label: 'Form Builder', href: '/admin/forms', icon: FileSpreadsheet },
  { label: 'Registrations', href: '/admin/registrations', icon: Users },
  { label: 'QR Scanner', href: '/admin/attendance/scanner', icon: QrCode },
  { label: 'Live Resources', href: '/admin/resources', icon: FolderDown },
  { label: 'Certificates', href: '/admin/certificates/templates', icon: Award },
  { label: 'Winner Cascade', href: '/admin/winners', icon: Trophy },
  { label: 'Leaderboard Config', href: '/admin/leaderboard', icon: Trophy },
  { label: 'Blogs Manager', href: '/admin/blogs', icon: FileText },
  { label: 'Gallery Manager', href: '/admin/gallery', icon: Image },
  { label: 'Team Manager', href: '/admin/team', icon: UserCheck },
  { label: 'Speaker Manager', href: '/admin/speakers', icon: Mic },
  { label: 'Notice Board', href: '/admin/notices', icon: BellRing },
  { label: 'Feedback Manager', href: '/admin/feedback', icon: MessageSquare },
  { label: 'Support Tickets', href: '/admin/tickets', icon: Ticket },
  { label: 'Push Notifications', href: '/admin/notifications', icon: Send },
  { label: 'Reports & Analytics', href: '/admin/reports', icon: BarChart3 },
  { label: 'RBAC Permission Engine', href: '/admin/rbac', icon: ShieldCheck },
  { label: 'Audit Logs', href: '/admin/audit-logs', icon: History },
  { label: 'Global Settings', href: '/admin/settings', icon: Settings }
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white dark:bg-[#151B23] border-r border-slate-200 dark:border-[#2A323D] flex flex-col justify-between p-4 h-full shrink-0 overflow-y-auto">
      <div className="space-y-6">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0078D4] dark:text-[#00A4EF] px-3 block mb-2">
            Admin Management Console
          </span>
          <nav className="space-y-1">
            {ADMIN_SIDEBAR_ITEMS.map((item) => {
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
