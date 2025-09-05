import { Metadata } from 'next';
import RegisterForm from './form';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Qeydiyyat',
  description:
    'Siz qeydiyyatdan keçərək bölümləri oxumaqdan əlavə onları bəyənmə, şərh yazma və oxuduğunuzu bildirməyi əldə edə bilərsiniz.',
  keywords: [
    'qeydiyyat',
    'register',
    'mahmud',
    'sign up',
    'user register',
    'account register',
    'access comments',
    'access favorites',
    'access reads',
    'mahmud register',
    'mahmud sign up',
  ],
  openGraph: {
    title: 'qeydiyyatdan keç • mahmud',
    description:
      'Qeydiyyatdan keçib, hesabınıza daxil olun və mahmudun bölümlərini bəyənib, şərh yazma xüsusiyyətini əldə edin.',
    url: `${process.env.NEXT_PUBLIC_APP_URL}/auth/register`,
    type: 'website',
  },
};

export default function RegisterPage() {
  return (
    <div className='min-h-screen bg-white flex items-center justify-center px-4 py-8'>
      <div className='w-full max-w-md'>
        {/* Header */}
        <div className='text-center mb-12'>
          <Link href='/' className='flex items-center justify-center gap-3 mb-8'>
            <span className='text-xl font-serif text-gray-900'>mahmud,</span>
          </Link>
          <h1 className='text-4xl font-serif text-gray-900 mb-4'>qeydiyyat</h1>
          <p className='text-sm text-gray-600'>mahmudla edəcəyin səyahətə bugündən başla</p>
        </div>

        <RegisterForm />
      </div>
    </div>
  );
}
