'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { MicrosoftFourSquareIcon } from '@/components/icons';
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
  Bell
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Events', href: '/events' },
  { label: 'Community', href: '/team' },
  { label: 'Resources', href: '/resources' },
  { label: 'Leaderboard', href: '/leaderboard' },
  { label: 'Blog', href: '/blog' }
];

export function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { user, isAuthenticated, logout, role } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let active = true;
    requestAnimationFrame(() => {
      if (active) setMounted(true);
    });
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      active = false;
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/85 dark:bg-[#0B0F14]/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-[#2A323D] shadow-md dark:shadow-2xl py-3'
          : 'bg-transparent py-4'
      }`}
    >
      {/* Top 4-Color Microsoft Thin Line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 ms-gradient-bar" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo & Identity */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-[#151B23] border border-slate-200 dark:border-[#2A323D] shadow-sm group-hover:scale-105 transition-transform">
              <MicrosoftFourSquareIcon className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-[#F5F7FA] flex items-center gap-1.5">
                Microsoft <span className="text-[#0078D4] dark:text-[#00A4EF]">Campus Club</span>
              </span>
              <p className="text-[10px] text-slate-500 dark:text-[#A8B0BB] -mt-0.5 tracking-wider uppercase font-semibold">
                Marwadi University
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/70 dark:bg-[#151B23]/70 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200/80 dark:border-[#2A323D]">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                    isActive
                      ? 'bg-[#0078D4] dark:bg-[#00A4EF] text-white shadow-sm shadow-sky-500/30'
                      : 'text-slate-700 dark:text-[#A8B0BB] hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-[#1B222C]'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Action Utilities */}
          <div className="hidden md:flex items-center gap-2">
            {/* Search */}
            <Link
              href="/search"
              className="p-2 text-slate-600 dark:text-[#A8B0BB] hover:text-slate-900 dark:hover:text-white rounded-xl bg-slate-100 dark:bg-[#151B23] border border-slate-200 dark:border-[#2A323D] hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              title="Global Search"
            >
              <Search className="w-4 h-4" />
            </Link>

            {/* Notifications */}
            <Link
              href="/dashboard/notifications"
              className="p-2 text-slate-600 dark:text-[#A8B0BB] hover:text-slate-900 dark:hover:text-white rounded-xl bg-slate-100 dark:bg-[#151B23] border border-slate-200 dark:border-[#2A323D] hover:border-slate-300 dark:hover:border-slate-700 transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#00A4EF]" />
            </Link>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 text-slate-600 dark:text-[#A8B0BB] hover:text-slate-900 dark:hover:text-white rounded-xl bg-slate-100 dark:bg-[#151B23] border border-slate-200 dark:border-[#2A323D] hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              title="Toggle Light/Dark Theme"
            >
              {mounted && theme === 'light' ? <Moon className="w-4 h-4 text-slate-700" /> : <Sun className="w-4 h-4 text-[#FFB900]" />}
            </button>

            {/* Auth Buttons */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2">
                <Link href="/dashboard">
                  <Button variant="fluent" size="sm">
                    <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
                  </Button>
                </Link>
                {['Super Admin', 'Website Admin', 'Event Manager', 'Content Manager', 'Media Manager'].includes(role) && (
                  <Link href="/admin">
                    <Button variant="secondary" size="sm">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#00A4EF]" /> Admin
                    </Button>
                  </Link>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  title="Sign Out"
                  className="px-2.5 text-slate-600 dark:text-[#A8B0BB] hover:text-[#F25022] hover:border-[#F25022]/40"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </Button>
              </div>
            ) : (
              <Link href="/login">
                <Button variant="fluent" size="sm">
                  <LogIn className="w-3.5 h-3.5" /> Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 text-slate-600 dark:text-[#A8B0BB] rounded-xl bg-slate-100 dark:bg-[#151B23] border border-slate-200 dark:border-[#2A323D]"
            >
              {mounted && theme === 'light' ? <Moon className="w-4 h-4 text-slate-700" /> : <Sun className="w-4 h-4 text-[#FFB900]" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 dark:text-[#A8B0BB] rounded-xl bg-slate-100 dark:bg-[#151B23] border border-slate-200 dark:border-[#2A323D]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[65px] bg-white/95 dark:bg-[#0B0F14]/95 backdrop-blur-2xl border-b border-slate-200 dark:border-[#2A323D] p-6 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-2">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-2.5 text-sm font-semibold rounded-xl border transition-colors ${
                  pathname === item.href
                    ? 'bg-[#0078D4] dark:bg-[#00A4EF] text-white border-transparent'
                    : 'bg-slate-50 dark:bg-[#151B23] text-slate-700 dark:text-[#A8B0BB] border-slate-200 dark:border-[#2A323D]'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-[#2A323D] flex flex-col gap-2">
            {isAuthenticated && user ? (
              <>
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="fluent" className="w-full">
                    <LayoutDashboard className="w-4 h-4" /> Student Dashboard
                  </Button>
                </Link>
                {['Super Admin', 'Website Admin', 'Event Manager', 'Content Manager', 'Media Manager'].includes(role) && (
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
      )}
    </header>
  );
}
