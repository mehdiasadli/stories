import { verifyEmail } from '@/lib/actions/auth.actions';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface VerifyPageProps {
  params: Promise<{ token: string }>;
}

export const metadata: Metadata = {
  title: 'E-poçtun Təsdiqi',
  description: 'Elektron poçtunuzun təsdiq edilməsi.',
  keywords: ['verify', 'email', 'verify email', 'təsdiq e-poçtu', 'təsdiq edilməsi'],
  robots: {
    index: false,
    follow: true,
  },
};

export default async function VerifyPage({ params }: VerifyPageProps) {
  const { token } = await params;

  const result = await verifyEmail(token);

  if (result.status === 'invalid') {
    return notFound();
  }

  return (
    <div className='min-h-screen bg-white flex items-center justify-center px-4'>
      <div className='max-w-md w-full'>
        {/* Logo */}
        <div className='text-center mb-12'>
          <div className='inline-flex items-center gap-3 mb-6'>
            <span className='text-2xl font-serif text-gray-900'>mahmud,</span>
          </div>
        </div>

        {/* Success */}
        {result.status === 'success' && (
          <div className='text-center'>
            <div className='mb-6'>
              <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <svg className='w-8 h-8 text-green-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                </svg>
              </div>
              <h1 className='text-2xl font-serif text-gray-900 mb-4'>E-poçtunuz Təsdiq Edildi!</h1>
              <p className='text-gray-600 mb-8'>
                mahmuda xoş gəlmisiniz, {result.data?.name}! E-poçtunuz təsdiq edildi və hesabınız aktivləşdirildi.
              </p>
            </div>

            <Link
              href='/auth/login'
              className='inline-block px-8 py-3 text-white bg-gray-900 hover:bg-gray-800 transition-colors font-medium'
            >
              hesabına daxil ol
            </Link>
          </div>
        )}

        {/* Already Verified */}
        {result.status === 'verified' && (
          <div className='text-center'>
            <div className='mb-6'>
              <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <svg className='w-8 h-8 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                  />
                </svg>
              </div>
              <h1 className='text-2xl font-serif text-gray-900 mb-4'>artıq təsdiq edilib</h1>
              <p className='text-gray-600 mb-8'>e-poçtunuz artıq təsdiq edilib. hesabınıza daxil ola bilərsiniz.</p>
            </div>

            <Link
              href='/auth/login'
              className='inline-block px-8 py-3 text-white bg-gray-900 hover:bg-gray-800 transition-colors font-medium'
            >
              hesabına daxil ol
            </Link>
          </div>
        )}

        {/* Expired */}
        {result.status === 'expired' && (
          <div className='text-center'>
            <div className='mb-6'>
              <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <svg className='w-8 h-8 text-red-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                  />
                </svg>
              </div>
              <h1 className='text-2xl font-serif text-gray-900 mb-4'>təsdiq linkinin vaxtı keçib</h1>
              <p className='text-gray-600 mb-8'>
                bu təsdiq linkinin vaxtı keçib. hesabınızı təsdiq etmək üçün yeni təsdiq e-poçtunu göndərin.
              </p>
            </div>

            <div className='space-y-3'>
              <Link
                href='/auth/register'
                className='block w-full px-8 py-3 text-white bg-gray-900 hover:bg-gray-800 transition-colors font-medium text-center'
              >
                yeni təsdiq e-poçtunu göndər
              </Link>
              <Link
                href='/auth/login'
                className='block w-full px-8 py-3 text-gray-600 hover:text-gray-900 transition-colors text-center border-b border-dotted border-gray-400 hover:border-gray-600'
              >
                daxil ol səhifəsinə qayıt
              </Link>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className='text-center mt-12 text-sm text-gray-500'>
          <p>
            kömək lazımdır? bizimlə əlaqə saxlayın.{' '}
            <a
              href='mailto:asadlimehdi2@gmail.com'
              className='text-gray-900 hover:text-gray-700 border-b border-dotted border-gray-400 hover:border-gray-600 transition-colors'
            >
              support@mahmud.az
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
