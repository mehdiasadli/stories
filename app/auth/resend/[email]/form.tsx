'use client';

import { resendVerification } from '@/lib/actions/auth.actions';
import { useActionState } from 'react';

interface ResendFormProps {
  email?: string;
}

export function ResendForm({ email }: ResendFormProps) {
  const [state, formAction, isPending] = useActionState(resendVerification, {
    success: false,
    data: null,
    error: null,
    message: '',
  });

  return (
    <div>
      <form action={formAction} className='space-y-6'>
        <div>
          <label htmlFor='email' className='block text-sm text-gray-700 mb-2'>
            e-poçt
          </label>
          <input
            id='email'
            type='email'
            autoComplete='email'
            value={email}
            placeholder='m@example.com'
            className='w-full px-3 py-2 border border-gray-200 focus:border-gray-400 focus:outline-none bg-white text-gray-900'
            disabled={isPending}
            aria-disabled={isPending}
            name='email'
            required
          />
        </div>

        {!!state.error && (
          <div className='text-sm text-red-600 p-3 border border-red-200 bg-red-50'>{state.message}</div>
        )}

        {state.success && (
          <div className='text-sm text-green-600 p-3 border border-green-200 bg-green-50'>{state.message}</div>
        )}

        <button
          type='submit'
          disabled={isPending}
          aria-disabled={isPending}
          className='w-full py-3 text-sm font-medium text-gray-900 bg-white border-2 border-gray-900 hover:bg-gray-900 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {isPending ? 'göndərilir...' : 'təsdiq e-poçtunu göndər'}
        </button>
      </form>
    </div>
  );
}
