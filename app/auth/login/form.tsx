'use client';

import { LoginSchema, TLogin } from '@/lib/schemas/auth.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const chapterRef = searchParams.get('chapterRef');
  const characterRef = searchParams.get('characterRef');
  const discussionRef = searchParams.get('discussionRef');

  const form = useForm<TLogin>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error('düzgün elektron poçt və ya şifrə daxil edin');
        return;
      } else if (result?.ok) {
        // Redirect to chapter if chapterRef is provided, otherwise go to home
        const redirectTo = discussionRef
          ? `/chapters/${discussionRef}/discussion`
          : chapterRef
            ? `/chapters/${chapterRef}`
            : characterRef
              ? `/characters/${characterRef}`
              : '/';
        router.push(redirectTo);
        router.refresh();
      }
    } catch (e) {
      toast.error('xəta baş verdi. yenidən cəhd edin.');
    } finally {
      setIsLoading(false);
    }
  });

  return (
    <div>
      <form onSubmit={onSubmit} className='space-y-6'>
        <div className='space-y-2'>
          <label htmlFor='email' className='text-sm text-gray-700'>
            e-poçt
          </label>
          <input
            id='email'
            type='email'
            placeholder='m@example.com'
            autoComplete='email'
            disabled={isLoading}
            className='w-full px-3 py-2 border border-gray-200 focus:border-gray-400 focus:outline-none bg-white text-gray-900'
            {...form.register('email')}
          />
          {form.formState.errors.email && <p className='text-sm text-red-600'>{form.formState.errors.email.message}</p>}
        </div>

        <div className='space-y-2'>
          <label htmlFor='password' className='text-sm text-gray-700'>
            şifrə
          </label>
          <input
            id='password'
            type='password'
            placeholder='şifrəni daxil et'
            autoComplete='current-password'
            disabled={isLoading}
            className='w-full px-3 py-2 border border-gray-200 focus:border-gray-400 focus:outline-none bg-white text-gray-900'
            {...form.register('password')}
          />
          {form.formState.errors.password && (
            <p className='text-sm text-red-600'>{form.formState.errors.password.message}</p>
          )}
        </div>

        {error && (
          <div className='space-y-3'>
            <div className='text-sm text-red-600 p-3 border border-red-200 bg-red-50'>{error}</div>
          </div>
        )}

        <button
          type='submit'
          disabled={isLoading}
          className='w-full py-3 text-sm font-medium text-gray-900 bg-white border-2 border-gray-900 hover:bg-gray-900 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {isLoading ? 'daxil olunur...' : 'daxil ol'}
        </button>
      </form>

      <div className='mt-8 text-center'>
        <p className='text-sm text-gray-600'>
          hesabın yoxdur?{' '}
          <Link
            href='/auth/register'
            className='text-gray-900 hover:text-gray-700 border-b border-dotted border-gray-400 hover:border-gray-600 transition-colors'
          >
            qeydiyyatdan keç
          </Link>
        </p>
        {error && (
          <p className='text-sm text-gray-600 mt-3'>
            <Link
              href={`/auth/resend?email=${encodeURIComponent(form.getValues('email') || '')}`}
              className='text-gray-900 hover:text-gray-700 border-b border-dotted border-gray-400 hover:border-gray-600 transition-colors'
            >
              təsdiq e-poçtunu yenidən göndər
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
