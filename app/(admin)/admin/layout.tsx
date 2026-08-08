import { ReactNode } from 'react';
import { Navbar } from '@/components/navigation/Navbar';
import { AdminSidebar } from '@/components/navigation/AdminSidebar';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 gradient-mesh">
      <Navbar />
      <div className="flex flex-1 pt-20">
        <AdminSidebar />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl">{children}</main>
      </div>
    </div>
  );
}
