'use client';

import { signUp } from '@/lib/actions/auth.actions';
import Link from 'next/link';
import { useActionState } from 'react';

export default function RegisterForm() {
  const [state, formAction, isPending] = useActionState(signUp, {
    success: false,
    data: null,
    error: null,
    message: '',
  });

  return (
    <div>
      <form action={formAction} className='space-y-6'>
        <div className='space-y-2'>
          <label htmlFor='name' className='text-sm text-gray-700'>
            ad və soyad
          </label>
          <input
            id='name'
            type='text'
            placeholder='Mahmud Elçibəyov'
            disabled={isPending}
            className='w-full px-3 py-2 border border-gray-200 focus:border-gray-400 focus:outline-none bg-white text-gray-900'
            name='name'
          />
        </div>

        <div className='space-y-2'>
          <label htmlFor='email' className='text-sm text-gray-700'>
            e-poçt
          </label>
          <input
            id='email'
            type='email'
            placeholder='m@example.com'
            autoComplete='email'
            disabled={isPending}
            className='w-full px-3 py-2 border border-gray-200 focus:border-gray-400 focus:outline-none bg-white text-gray-900'
            name='email'
          />
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
            disabled={isPending}
            className='w-full px-3 py-2 border border-gray-200 focus:border-gray-400 focus:outline-none bg-white text-gray-900'
            name='password'
          />
        </div>

        {!!state.error && (
          <div className='space-y-3'>
            <div className='text-sm text-red-600 p-3 border border-red-200 bg-red-50'>{state.message}</div>
          </div>
        )}

        {state.success && (
          <div className='space-y-3'>
            <div className='text-sm text-green-600 p-3 border border-green-200 bg-green-50'>{state.message}</div>
            <div className='text-center'>
              <Link
                href={`/auth/resend/${encodeURIComponent(state.data?.email || '')}`}
                className='text-sm text-gray-600 hover:text-gray-900 border-b border-dotted border-gray-400 hover:border-gray-600 transition-colors'
              >
                e-poçt almadınız? təsdiq linkini yenidən göndər
              </Link>
            </div>
          </div>
        )}

        <button
          type='submit'
          disabled={isPending || !!state.success}
          className='w-full py-3 text-sm font-medium text-gray-900 bg-white border-2 border-gray-900 hover:bg-gray-900 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {isPending ? 'hesab yaradılır...' : state.success ? 'hesab yaradıldı' : 'hesab yarat'}
        </button>
      </form>

      <div className='mt-8 text-center'>
        <p className='text-sm text-gray-600'>
          hesabın var?{' '}
          <Link
            href='/auth/login'
            className='text-gray-900 hover:text-gray-700 border-b border-dotted border-gray-400 hover:border-gray-600 transition-colors'
          >
            daxil ol
          </Link>
        </p>
      </div>
    </div>
  );
}
