/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useActionState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface AddReplyProps {
  parentId: string;
  chapterSlug: string;
  onReplyAdded: () => void;
  onCancel?: () => void;
  createCommentAction: (prevState: any, formData: FormData) => Promise<any>;
}

export function AddReply({ parentId, chapterSlug, onReplyAdded, onCancel, createCommentAction }: AddReplyProps) {
  const { data: session, status } = useSession();
  const [state, formAction, isPending] = useActionState(createCommentAction, {
    success: false,
    data: null,
    error: null,
    message: '',
  });

  // Handle success - notify parent
  useEffect(() => {
    if (state.success && !isPending) {
      onReplyAdded();
    }
  }, [state.success, isPending, onReplyAdded]);

  if (status === 'loading') {
    return (
      <div className='mt-4 pt-4 border-t border-gray-200'>
        <div className='text-sm text-gray-500'>yüklənir...</div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className='mt-4 pt-4 border-t border-gray-200'>
        <div className='text-center py-4'>
          <p className='text-sm text-gray-600 mb-3'>cavab vermək üçün daxil ol</p>
          <div className='flex gap-2 justify-center'>
            <Link
              href={`/auth/login?discussionRef=${chapterSlug}`}
              className='text-xs text-gray-600 hover:text-gray-900 transition-colors border border-gray-200 hover:border-gray-400 px-3 py-1 bg-white hover:bg-gray-50'
            >
              daxil ol
            </Link>
            {onCancel && (
              <button
                onClick={onCancel}
                className='text-xs text-gray-500 hover:text-gray-700 transition-colors px-3 py-1'
              >
                ləğv et
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='mt-4 pt-4 border-t border-gray-200'>
      <div className='flex items-center justify-between mb-4'>
        <h4 className='text-sm text-gray-700'>cavab</h4>
        {onCancel && (
          <button onClick={onCancel} className='text-xs text-gray-500 hover:text-gray-700 transition-colors'>
            ləğv et
          </button>
        )}
      </div>

      <form action={formAction} className='space-y-4'>
        <input type='hidden' name='chapterSlug' value={chapterSlug} />
        <input type='hidden' name='parentId' value={parentId} />

        <div>
          <textarea
            name='content'
            placeholder='cavabınızı yazın...'
            className='w-full px-3 py-2 border border-gray-200 focus:border-gray-400 focus:outline-none bg-white text-gray-900 resize-vertical min-h-[80px]'
            disabled={isPending}
          />
        </div>

        <div className='flex justify-end'>
          <button
            type='submit'
            disabled={isPending}
            className='text-sm text-gray-600 hover:text-gray-900 transition-colors border border-gray-200 hover:border-gray-400 px-4 py-2 bg-white hover:bg-gray-50'
          >
            {isPending ? 'göndərilir...' : 'cavab göndər'}
          </button>
        </div>
      </form>
    </div>
  );
}
