import { Metadata } from 'next';
import LoginForm from './form';
import Link from 'next/link';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Daxil ol',
  description:
    'Hesabınıza daxil olaraq bölümləri oxumaqdan əlavə onları bəyənmə, şərh yazma və oxuduğunuzu bildirməyi əldə edə bilərsiniz.',
  keywords: [
    'daxil ol',
    'login',
    'mahmud',
    'sign in',
    'user login',
    'account login',
    'access comments',
    'access favorites',
    'access reads',
    'mahmud login',
    'mahmud sign in',
  ],
  openGraph: {
    title: 'hesabına daxil ol • mahmud',
    description: 'Hesabınıza daxil olun və mahmudun bölümlərini bəyənib, şərh yazma xüsusiyyətini əldə edin.',
    url: `${process.env.NEXT_PUBLIC_APP_URL}/auth/login`,
    type: 'website',
  },
};

export default function LoginPage() {
  return (
    <div className='min-h-screen bg-white flex items-center justify-center px-4 py-8'>
      <div className='w-full max-w-md'>
        {/* Header */}
        <div className='text-center mb-12'>
          <Link href='/' className='flex items-center justify-center gap-3 mb-8'>
            <span className='text-xl font-serif text-gray-900'>mahmud,</span>
          </Link>
          <h1 className='text-4xl font-serif text-gray-900 mb-4'>daxil ol</h1>
          <p className='text-sm text-gray-600'>mahmudla edəcəyin səyahətə xoş gəlmisən</p>
        </div>

        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
