'use client';

import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

export function NavUser() {
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (status === 'loading') {
    return <div className='text-sm text-gray-500'>yüklənir...</div>;
  }

  if (!session) {
    return (
      <div className='flex items-center gap-4'>
        <Link href='/auth/login' className='text-sm text-gray-600 hover:text-gray-900 transition-colors'>
          daxil ol
        </Link>
        <Link
          href='/auth/register'
          className='text-sm text-gray-600 hover:text-gray-900 transition-colors border border-gray-200 hover:border-gray-400 px-3 py-1'
        >
          qeydiyyat
        </Link>
      </div>
    );
  }

  const user = session.user;

  return (
    <div className='relative'>
      <div className='flex items-center gap-7'>
        {user.admin && (
          <Link
            href='/dashboard/chapters'
            className='flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors'
          >
            <span>dashboard</span>
          </Link>
        )}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className='flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors'
        >
          <span>{user.name}</span>
        </button>
      </div>

      {isMenuOpen && (
        <>
          {/* Backdrop */}
          <div className='fixed inset-0 z-10' onClick={() => setIsMenuOpen(false)} />

          {/* Menu */}
          <div className='absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 shadow-sm z-20'>
            <div className='p-3 border-b border-gray-200'>
              <div className='text-sm font-medium text-gray-900'>{user.name}</div>
              <div className='text-xs text-gray-500'>{user.email}</div>
            </div>

            <div className='py-2'>
              <Link
                href={`/users/${user.slug}`}
                className='block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors'
                onClick={() => setIsMenuOpen(false)}
              >
                profil
              </Link>
              {/* <Link
                href='/settings'
                className='block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors'
                onClick={() => setIsMenuOpen(false)}
              >
                ayarlar
              </Link> */}
            </div>

            <div className='border-t border-gray-200 py-2'>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  signOut();
                }}
                className='w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors flex items-center gap-2'
              >
                <LogOut className='w-4 h-4' />
                çıxış
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
