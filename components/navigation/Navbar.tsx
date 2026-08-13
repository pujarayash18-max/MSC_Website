'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/lib/theme-provider';
import { useAuth } from '@/hooks/useAuth';
import { isAdminRole } from '@/lib/constants/roles';
import { Button } from '@/components/ui/button';
import { OrgBadge } from '@/components/branding/OrgBadge';
import {
  Sun,
  Moon,
  Search,
  Menu,
  X,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  LogIn,
  Bell,
  ChevronDown,
} from 'lucide-react';

// Primary links – always shown in the desktop nav pill
const PRIMARY_NAV = [
  { label: 'Home', href: '/#home' },
  { label: 'Events', href: '/#events' },
  { label: 'Speakers', href: '/#speakers' },
  { label: 'Community', href: '/#community' },
];

// Secondary links – tucked into the "More" dropdown
const MORE_NAV = [
  { label: 'Resources', href: '/resources' },
  { label: 'Leaderboard', href: '/leaderboard' },
  { label: 'Blog', href: '/blog' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Support Ticket', href: '/contact' },
];


export function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { user, isAuthenticated, logout, role } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close "More" dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isMoreActive = MORE_NAV.some(
    (item) => pathname === item.href || pathname.startsWith(item.href)
  );

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/92 dark:bg-[#0B0F14]/92 backdrop-blur-xl border-b border-slate-200/80 dark:border-[#2A323D] shadow-md dark:shadow-2xl py-2'
          : 'bg-transparent py-3'
      }`}
    >
      {/* Top Microsoft 4-Color bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5 ms-gradient-bar" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 3-col grid: logo | centered nav | actions */}
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4">
          {/* ── Logo ── */}
          <OrgBadge size="sm" variant="navbar" />

          {/* ── Primary Nav Pill – centered ── */}
          <nav className="hidden xl:flex items-center justify-center">
            <div className="flex items-center gap-0.5 bg-slate-100/70 dark:bg-[#151B23]/70 backdrop-blur-md px-1.5 py-1 rounded-2xl border border-slate-200/80 dark:border-[#2A323D]">
            {PRIMARY_NAV.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-[#0078D4] dark:bg-[#00A4EF] text-white shadow-sm shadow-sky-500/30'
                      : 'text-slate-600 dark:text-[#A8B0BB] hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-[#1B222C]'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            {/* ── More dropdown ── */}
            <div className="relative" ref={moreRef}>
              <button
                onClick={() => setMoreOpen((v) => !v)}
                className={`flex items-center gap-1 px-3.5 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
                  isMoreActive
                    ? 'bg-[#0078D4] dark:bg-[#00A4EF] text-white shadow-sm shadow-sky-500/30'
                    : 'text-slate-600 dark:text-[#A8B0BB] hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-[#1B222C]'
                }`}
              >
                More
                <ChevronDown
                  className={`w-3 h-3 transition-transform duration-200 ${moreOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {moreOpen && (
                <div className="absolute top-full left-0 mt-2 w-44 bg-white dark:bg-[#151B23] border border-slate-200 dark:border-[#2A323D] rounded-2xl shadow-xl shadow-black/10 dark:shadow-black/40 overflow-hidden z-50 py-1">
                  {MORE_NAV.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      (item.href !== '/' && pathname.startsWith(item.href));
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMoreOpen(false)}
                        className={`flex items-center px-4 py-2.5 text-xs font-semibold transition-colors ${
                          isActive
                            ? 'text-[#0078D4] dark:text-[#00A4EF] bg-blue-50 dark:bg-[#0078D4]/10'
                            : 'text-slate-700 dark:text-[#A8B0BB] hover:bg-slate-50 dark:hover:bg-[#1B222C] hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
            </div>
          </nav>

          {/* ── Right: icon group + auth ── */}
          <div className="hidden md:flex items-center gap-2">
            {/* Icon trio in a single pill */}
            <div className="flex items-center bg-slate-100 dark:bg-[#151B23] border border-slate-200 dark:border-[#2A323D] rounded-xl overflow-hidden">
              <Link
                href="/search"
                title="Search"
                className="p-2 text-slate-500 dark:text-[#A8B0BB] hover:text-[#0078D4] dark:hover:text-[#00A4EF] hover:bg-slate-200/60 dark:hover:bg-[#1B222C] transition-colors"
              >
                <Search className="w-4 h-4" />
              </Link>
              <Link
                href="/dashboard/notifications"
                title="Notifications"
                className="relative p-2 text-slate-500 dark:text-[#A8B0BB] hover:text-[#0078D4] dark:hover:text-[#00A4EF] hover:bg-slate-200/60 dark:hover:bg-[#1B222C] transition-colors"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#00A4EF]" />
              </Link>
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                title="Toggle theme"
                className="p-2 text-slate-500 dark:text-[#A8B0BB] hover:text-[#0078D4] dark:hover:text-[#00A4EF] hover:bg-slate-200/60 dark:hover:bg-[#1B222C] transition-colors"
              >
                {mounted && theme === 'light' ? (
                  <Moon className="w-4 h-4" />
                ) : (
                  <Sun className="w-4 h-4 text-[#FFB900]" />
                )}
              </button>
            </div>

            {/* Auth area */}
            {mounted && isAuthenticated && user ? (
              <div className="flex items-center gap-1.5">
                <Link href="/dashboard">
                  <Button variant="fluent" size="sm" className="text-xs px-3 h-8">
                    <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
                  </Button>
                </Link>
                {isAdminRole(role) && (
                  <Link href="/admin">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="text-xs px-3 h-8 bg-sky-500/10 text-sky-600 dark:text-[#00A4EF] border-sky-500/30"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-[#00A4EF]" /> Admin
                    </Button>
                  </Link>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  title="Sign Out"
                  className="px-2.5 h-8 text-slate-500 dark:text-[#A8B0BB] hover:text-[#F25022] hover:border-[#F25022]/40"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </Button>
              </div>
            ) : (
              <Link href="/login">
                <Button variant="fluent" size="sm" className="text-xs px-3 h-8">
                  <LogIn className="w-3.5 h-3.5" /> Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* ── Mobile controls ── */}
          <div className="flex xl:hidden items-center gap-2 ml-auto">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 text-slate-500 dark:text-[#A8B0BB] rounded-xl bg-slate-100 dark:bg-[#151B23] border border-slate-200 dark:border-[#2A323D]"
            >
              {mounted && theme === 'light' ? (
                <Moon className="w-4 h-4 text-slate-700" />
              ) : (
                <Sun className="w-4 h-4 text-[#FFB900]" />
              )}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-500 dark:text-[#A8B0BB] rounded-xl bg-slate-100 dark:bg-[#151B23] border border-slate-200 dark:border-[#2A323D]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Drawer ── */}
      {mobileMenuOpen && (
        <div className="xl:hidden fixed inset-x-0 top-[60px] bg-white/97 dark:bg-[#0B0F14]/97 backdrop-blur-2xl border-b border-slate-200 dark:border-[#2A323D] shadow-2xl max-h-[85vh] overflow-y-auto">
          <div className="p-5 space-y-4">
            {/* Primary links */}
            <div className="grid grid-cols-2 gap-2">
              {PRIMARY_NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-2.5 text-sm font-semibold rounded-xl border text-center transition-colors ${
                    pathname === item.href
                      ? 'bg-[#0078D4] dark:bg-[#00A4EF] text-white border-transparent'
                      : 'bg-slate-50 dark:bg-[#151B23] text-slate-700 dark:text-[#A8B0BB] border-slate-200 dark:border-[#2A323D]'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Secondary links */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-600 mb-2 px-1">
                More
              </p>
              <div className="grid grid-cols-2 gap-2">
                {MORE_NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-2.5 text-sm font-semibold rounded-xl border text-center transition-colors ${
                      pathname === item.href
                        ? 'bg-[#0078D4] dark:bg-[#00A4EF] text-white border-transparent'
                        : 'bg-slate-50 dark:bg-[#151B23] text-slate-700 dark:text-[#A8B0BB] border-slate-200 dark:border-[#2A323D]'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Auth */}
            <div className="pt-3 border-t border-slate-200 dark:border-[#2A323D] flex flex-col gap-2">
              {isAuthenticated && user ? (
                <>
                  <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="fluent" className="w-full">
                      <LayoutDashboard className="w-4 h-4" /> Student Dashboard
                    </Button>
                  </Link>
                  {isAdminRole(role) && (
                    <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="secondary" className="w-full">
                        <ShieldCheck className="w-4 h-4 text-[#00A4EF]" /> Admin Console
                      </Button>
                    </Link>
                  )}
                  <Button variant="outline" onClick={logout} className="w-full text-[#F25022]">
                    <LogOut className="w-4 h-4" /> Logout
                  </Button>
                </>
              ) : (
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="fluent" className="w-full">
                    <LogIn className="w-4 h-4" /> Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

