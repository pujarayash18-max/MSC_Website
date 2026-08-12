import { ReactNode } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/navigation/Navbar';
import { Footer } from '@/components/navigation/Footer';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/jwt';
import { isAdminRole } from '@/lib/constants/roles';
import MaintenancePage from '@/app/maintenance/page';
import { AlertTriangle, Settings } from 'lucide-react';

export default async function PublicLayout({ children }: { children: ReactNode }) {
  try {
    const settings = await prisma.settings.findUnique({ where: { id: 'global' } });

    if (settings?.maintenanceMode) {
      const session = await getSession();
      const isAdmin = session ? isAdminRole(session.roleName) : false;

      // If NOT admin, show maintenance page
      if (!isAdmin) {
        return (
          <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 gradient-mesh">
            <Navbar />
            <main className="flex-1 pt-24 pb-16">
              <MaintenancePage />
            </main>
            <Footer />
          </div>
        );
      }

      // If Admin, show Maintenance Page with prominent Top Admin Banner
      return (
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 gradient-mesh">
          <div className="bg-amber-500 text-slate-950 text-xs font-bold px-4 py-2.5 text-center flex items-center justify-center gap-2 fixed top-0 left-0 right-0 z-50 shadow-md">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>MAINTENANCE MODE IS LIVE ACTIVE — Public visitors &amp; students see the Maintenance Page.</span>
            <Link href="/admin/settings" className="underline hover:opacity-80 flex items-center gap-1 font-extrabold ml-2">
              <Settings className="w-3.5 h-3.5" /> Manage Settings
            </Link>
          </div>
          <Navbar />
          <main className="flex-1 pt-28 pb-16">
            <MaintenancePage />
          </main>
          <Footer />
        </div>
      );
    }
  } catch (e) {
    console.error('Error checking maintenance settings in PublicLayout:', e);
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 gradient-mesh">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">{children}</main>
      <Footer />
    </div>
  );
}
