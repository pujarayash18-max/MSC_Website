import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Microsoft Campus Club (MCC) - Marwadi University',
  description:
    'Official Digital Ecosystem for Microsoft Campus Club (MCC) at Marwadi University. Events, workshops, hackathons, certificates, leaderboards, and community learning.',
  keywords: [
    'Microsoft Campus Club',
    'MCC Marwadi University',
    'Microsoft Student Ambassador',
    'Marwadi University Club',
    'Azure Workshops',
    'Hackathons Rajkot'
  ],
  authors: [{ name: 'Microsoft Campus Club Team' }],
  manifest: '/manifest.json'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen antialiased selection:bg-sky-500 selection:text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
