import { Navbar } from '@/components/navigation/Navbar';
import { AdminSidebar } from '@/components/navigation/AdminSidebar';
import { AuthGuard } from '@/components/auth/AuthGuard';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requireAdmin={true}>
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F14] text-slate-900 dark:text-[#F5F7FA] pt-20">
        <Navbar />
        <div className="flex h-[calc(100vh-80px)]">
          <div className="hidden lg:block">
            <AdminSidebar />
          </div>
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
