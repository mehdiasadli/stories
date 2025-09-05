/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useActionState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface AddCommentProps {
  chapterSlug: string;
  createCommentAction: (prevState: any, formData: FormData) => Promise<any>;
  onCommentAdded?: () => void;
}

export function AddComment({ chapterSlug, createCommentAction, onCommentAdded }: AddCommentProps) {
  const { data: session, status } = useSession();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(createCommentAction, {
    success: false,
    data: null,
    error: null,
    message: '',
  });

  // Handle success - clear form and notify parent
  useEffect(() => {
    if (state.success && !isPending) {
      formRef.current?.reset();
      if (onCommentAdded) {
        // Add a small delay to ensure the server action completed
        setTimeout(() => {
          onCommentAdded();
        }, 100);
      }
    }
  }, [state.success, isPending, onCommentAdded]);

  if (status === 'loading') {
    return (
      <div className='border-b border-gray-200 pb-6 mb-6'>
        <div className='text-sm text-gray-500'>yüklənir...</div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className='border-b border-gray-200 pb-6 mb-6'>
        <div className='text-center py-8'>
          <p className='text-sm text-gray-600 mb-4'>şərh yazmaq üçün daxil ol</p>
          <div className='flex gap-3 justify-center'>
            <Link
              href={`/auth/login?discussionRef=${chapterSlug}`}
              className='text-sm text-gray-600 hover:text-gray-900 transition-colors border border-gray-200 hover:border-gray-400 px-4 py-2 bg-white hover:bg-gray-50'
            >
              daxil ol
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='border-b border-gray-200 pb-6 mb-6'>
      <h3 className='text-sm text-gray-700 mb-4'>şərh yaz</h3>

      <form ref={formRef} action={formAction} className='space-y-4'>
        <input type='hidden' name='chapterSlug' value={chapterSlug} />

        <div>
          <textarea
            placeholder='bölüm haqqında fikirlərini paylaş...'
            className='w-full px-3 py-2 border border-gray-200 focus:border-gray-400 focus:outline-none bg-white text-gray-900 resize-vertical min-h-[100px]'
            disabled={isPending}
            name='content'
          />
        </div>

        <div className='flex justify-between items-center'>
          {!!state.error && (
            <div className='text-sm text-red-600 p-3 border border-red-200 bg-red-50'>{state.message}</div>
          )}

          {state.success && (
            <div className='text-sm text-green-600 p-3 border border-green-200 bg-green-50'>{state.message}</div>
          )}

          <button
            type='submit'
            disabled={isPending}
            className='text-sm text-gray-600 hover:text-gray-900 transition-colors border border-gray-200 hover:border-gray-400 px-4 py-2 bg-white hover:bg-gray-50'
          >
            {isPending ? 'göndərilir...' : 'şərh göndər'}
          </button>
        </div>
      </form>
    </div>
  );
}
