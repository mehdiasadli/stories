import { DashboardTabs } from '@/components/dashboard-tabs';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Dashboard',
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='min-h-screen bg-white'>
      <DashboardTabs />
      <main className='max-w-7xl mx-auto px-4 sm:px-6 py-8'>{children}</main>
    </div>
  );
}
