import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import '@/styles/globals.css';
import { DashboardShell } from '@/components/layout/DashboardShell';

const jakarta = Plus_Jakarta_Sans({ 
  subsets: ['latin'],
  variable: '--font-jakarta'
});

export const metadata: Metadata = {
  title: 'LifeLink — Admin Dashboard & Emergency Blood Portal',
  description: 'Next-generation web portal for emergency blood management, donors registry, and live hospital dispatch.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${jakarta.className} bg-[#090d16] text-slate-100 min-h-screen selection:bg-red-500 selection:text-white`}>
        <DashboardShell>
          {children}
        </DashboardShell>
      </body>
    </html>
  );
}
