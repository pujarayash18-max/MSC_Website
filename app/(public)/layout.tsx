import { ReactNode } from 'react';
import { Navbar } from '@/components/navigation/Navbar';
import { Footer } from '@/components/navigation/Footer';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 gradient-mesh">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">{children}</main>
      <Footer />
    </div>
  );
}
