import { NavUser } from '@/components/nav-user';
import Link from 'next/link';

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='min-h-screen bg-white'>
      <header className='border-b border-gray-200 bg-white'>
        <div className='flex items-center justify-between px-4 sm:px-6 py-4'>
          <div className='flex items-center gap-8'>
            {/* Logo */}
            <Link href='/' className='flex items-center gap-3'>
              <span className='text-xl font-serif text-gray-900 sm:inline'>mahmud</span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className='md:flex items-center gap-6'>
              <Link href='/characters' className='text-sm text-gray-600 hover:text-gray-900 transition-colors'>
                wiki
              </Link>
              {/* <Link href='/explore' className='text-sm text-gray-600 hover:text-gray-900 transition-colors'>
                Explore
              </Link>
              <Link href='/characters' className='text-sm text-gray-600 hover:text-gray-900 transition-colors'>
                Characters
              </Link> */}
            </nav>
          </div>

          <div className='flex items-center gap-4'>
            <NavUser />
          </div>
        </div>
      </header>

      <main className='px-4 sm:px-6 py-8'>{children}</main>
    </div>
  );
}
