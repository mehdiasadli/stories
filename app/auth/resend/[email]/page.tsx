import Link from 'next/link';
import { ResendForm } from './form';
import { Metadata } from 'next';

interface ResendPageProps {
  params: Promise<{ email: string }>;
}

export async function generateMetadata({ params }: ResendPageProps): Promise<Metadata> {
  const { email } = await params;

  return {
    title: 'Təsdiq E-poçtunu Təkrar Göndər',
    description: 'Təsdiq E-poçtunu təkrar göndər.',
    keywords: ['resend', 'verification', 'email', 'resend verification email', 'təsdiq e-poçtu', 'təkrar göndər'],
    openGraph: {
      title: 'təsdiq e-poçtunu təkrar göndər • mahmud',
      description: 'Təsdiq E-poçtunu təkrar göndər.',
      url: `${process.env.NEXT_PUBLIC_APP_URL}/auth/resend/${email}`,
      type: 'website',
    },
  };
}

export default async function ResendPage({ params }: ResendPageProps) {
  const { email } = await params;

  return (
    <div className='min-h-screen bg-white flex items-center justify-center px-4'>
      <div className='w-full max-w-md'>
        {/* Logo */}
        <div className='text-center mb-12'>
          <Link href='/' className='inline-flex items-center gap-3 mb-6'>
            <span className='text-2xl font-serif text-gray-900'>mahmud,</span>
          </Link>
        </div>

        {/* Resend Form */}
        <ResendForm email={decodeURIComponent(email)} />

        {/* Footer Links */}
        <div className='mt-8 text-center space-y-2'>
          <p className='text-sm text-gray-600'>
            <Link
              href='/auth/login'
              className='text-gray-900 hover:text-gray-700 border-b border-dotted border-gray-400 hover:border-gray-600 transition-colors'
            >
              daxil ola qayıt
            </Link>
          </p>
          <p className='text-sm text-gray-600'>
            hesabın yoxdur?{' '}
            <Link
              href='/auth/register'
              className='text-gray-900 hover:text-gray-700 border-b border-dotted border-gray-400 hover:border-gray-600 transition-colors'
            >
              qeydiyyatdan keç
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
