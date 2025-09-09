import Logo from '@/components/logo';
import { NavUser } from '@/components/nav-user';
import { Notifications } from '@/components/notifications';
import Link from 'next/link';

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='min-h-screen bg-white'>
      <header className='border-b border-gray-200 bg-white'>
        <div className='flex items-center justify-between px-4 sm:px-6 py-4'>
          <div className='flex items-center gap-6'>
            <Link href='/' className='flex items-center gap-3'>
              <Logo size={25} />
            </Link>

            <nav className='flex items-center gap-6'>
              <Link href='/' className='hidden md:block text-sm text-gray-600 hover:text-gray-900 transition-colors'>
                bölümlər
              </Link>
              <Link href='/about' className='text-sm text-gray-600 hover:text-gray-900 transition-colors'>
                haqqında
              </Link>
              <Link href='/characters' className='text-sm text-gray-600 hover:text-gray-900 transition-colors'>
                wiki
              </Link>
            </nav>
          </div>

          <div className='flex items-center gap-4'>
            <Notifications />
            <NavUser />
          </div>
        </div>
      </header>

      <main className='px-4 sm:px-6 py-8'>{children}</main>
    </div>
  );
}
