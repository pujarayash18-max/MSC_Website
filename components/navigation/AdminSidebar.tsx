'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { usePermission } from '@/hooks/usePermission';
import {
  LayoutDashboard,
  Calendar,
  FormInput,
  Users,
  QrCode,
  FolderUp,
  Trophy,
  BarChart3,
  Award,
  Mic,
  UserCheck,
  FileText,
  Image,
  BellRing,
  Ticket,
  Send,
  ShieldCheck,
  History,
  FileSpreadsheet,
  Settings,
  Sparkles
} from 'lucide-react';

const ADMIN_NAV = [
  { label: 'Admin Overview', href: '/admin', icon: LayoutDashboard, module: 'Dashboard' as const },
  { label: 'Events Management', href: '/admin/events', icon: Calendar, module: 'Events' as const },
  { label: 'Form Builder', href: '/admin/forms', icon: FormInput, module: 'Registration Forms' as const },
  { label: 'Registrations', href: '/admin/registrations', icon: Users, module: 'Registrations' as const },
  { label: 'QR Scanner', href: '/admin/attendance/scanner', icon: QrCode, module: 'Attendance' as const },
  { label: 'Live Resources', href: '/admin/resources', icon: FolderUp, module: 'Event Resources' as const },
  { label: 'Winner Management', href: '/admin/winners', icon: Trophy, module: 'Winners' as const },
  { label: 'Leaderboard Config', href: '/admin/leaderboard', icon: BarChart3, module: 'Leaderboard' as const },
  { label: 'Certificate Generator', href: '/admin/certificates/templates', icon: Award, module: 'Certificates' as const },
  { label: 'Speakers Manager', href: '/admin/speakers', icon: Mic, module: 'Speaker Profiles' as const },
  { label: 'Team Manager', href: '/admin/team', icon: UserCheck, module: 'Team Profiles' as const },
  { label: 'Blog Manager', href: '/admin/blogs', icon: FileText, module: 'Blogs' as const },
  { label: 'Gallery Manager', href: '/admin/gallery', icon: Image, module: 'Gallery' as const },
  { label: 'Notice Board', href: '/admin/notices', icon: BellRing, module: 'Notices' as const },
  { label: 'Support Tickets', href: '/admin/tickets', icon: Ticket, module: 'Contact Tickets' as const },
  { label: 'Send Notifications', href: '/admin/notifications', icon: Send, module: 'Dashboard' as const },
  { label: 'RBAC Matrix', href: '/admin/rbac', icon: ShieldCheck, module: 'RBAC' as const },
  { label: 'Audit Logs', href: '/admin/audit-logs', icon: History, module: 'Audit Logs' as const },
  { label: 'Reports & Analytics', href: '/admin/reports', icon: FileSpreadsheet, module: 'Reports' as const },
  { label: 'System Settings', href: '/admin/settings', icon: Settings, module: 'Settings' as const }
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { user, role, setMockUserRole } = useAuth();
  const { hasPermission } = usePermission();

  return (
    <aside className="w-64 bg-slate-950/90 backdrop-blur-xl border-r border-slate-800/80 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between">
      <div className="space-y-4">
        {/* Admin Badge */}
        <div className="p-3 rounded-2xl bg-gradient-to-r from-sky-950/80 to-slate-900 border border-sky-500/30 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-sky-400 tracking-wider">Admin Console</span>
            <h4 className="text-xs font-bold text-white truncate">{role}</h4>
          </div>
          <ShieldCheck className="w-5 h-5 text-sky-400" />
        </div>

        {/* Role Switcher for Dev & Audit Testing */}
        <div className="px-1 py-1">
          <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Switch Role (Dev Testing)
          </label>
          <select
            value={role}
            onChange={(e) => setMockUserRole(e.target.value as any)}
            className="w-full text-xs bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-slate-300 focus:ring-1 focus:ring-sky-500"
          >
            <option value="Super Admin">Super Admin</option>
            <option value="Website Admin">Website Admin</option>
            <option value="Event Manager">Event Manager</option>
            <option value="Content Manager">Content Manager</option>
            <option value="Media Manager">Media Manager</option>
            <option value="Faculty Coordinator">Faculty Coordinator</option>
            <option value="President">President</option>
            <option value="Vice President">Vice President</option>
            <option value="Technical Lead">Technical Lead</option>
          </select>
        </div>

        {/* Navigation */}
        <nav className="space-y-0.5 overflow-y-auto max-h-[60vh] pr-1">
          {ADMIN_NAV.map((item) => {
            const Icon = item.icon;
            const canView = hasPermission(item.module, 'View');
            if (!canView) return null;

            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white font-semibold shadow-md shadow-sky-600/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-500 text-center">
        MCC Management Platform v2.0
      </div>
    </aside>
  );
}
