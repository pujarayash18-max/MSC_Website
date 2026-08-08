'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  Sun,
  Moon,
  Search,
  Menu,
  X,
  LayoutDashboard,
  LogOut,
  Sparkles,
  ShieldCheck,
  UserPlus,
  LogIn
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Team', href: '/team' },
  { label: 'Speakers', href: '/speakers' },
  { label: 'Events', href: '/events' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Projects', href: '/projects' },
  { label: 'Blog', href: '/blog' },
  { label: 'Leaderboard', href: '/leaderboard' },
  { label: 'Join Us', href: '/join-us' },
  { label: 'Contact', href: '/contact' }
];

export function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { user, isAuthenticated, logout, role } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 shadow-2xl py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo & Identity */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/25 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
                Microsoft <span className="text-sky-400">Campus Club</span>
              </span>
              <p className="text-[10px] text-slate-400 -mt-0.5 tracking-wider uppercase font-semibold">
                Marwadi University
              </p>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Search */}
            <Link
              href="/search"
              className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors"
              title="Global Search"
            >
              <Search className="w-4 h-4" />
            </Link>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors"
              title="Toggle Theme"
            >
              {mounted && theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
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
                      <ShieldCheck className="w-3.5 h-3.5 text-sky-400" /> Admin
                    </Button>
                  </Link>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  title="Sign Out"
                  className="px-2.5 text-slate-400 hover:text-rose-400 hover:border-rose-500/30"
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
              className="p-2 text-slate-400 rounded-lg bg-slate-900 border border-slate-800"
            >
              {mounted && theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 rounded-lg bg-slate-900 border border-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[65px] bg-slate-950/95 backdrop-blur-2xl border-b border-slate-800 p-6 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-2">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-2.5 text-sm font-medium rounded-xl border transition-colors ${
                  pathname === item.href
                    ? 'bg-sky-500/20 text-sky-400 border-sky-500/40'
                    : 'bg-slate-900/60 text-slate-300 border-slate-800'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-800 flex flex-col gap-2">
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
                      <ShieldCheck className="w-4 h-4 text-sky-400" /> Admin Console
                    </Button>
                  </Link>
                )}
                <Button variant="outline" onClick={logout} className="w-full text-rose-400">
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
