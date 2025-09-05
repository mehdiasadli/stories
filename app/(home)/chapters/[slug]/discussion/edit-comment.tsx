/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useActionState, useEffect } from 'react';

interface EditCommentProps {
  comment: {
    id: string;
    content: string;
  };
  onUpdate: () => void;
  onCancel: () => void;
  updateCommentAction: (prevState: unknown, formData: FormData) => Promise<any>;
}

export function EditComment({ comment, onUpdate, onCancel, updateCommentAction }: EditCommentProps) {
  const [state, formAction, isPending] = useActionState(updateCommentAction, {
    success: false,
    data: null,
    error: null,
    message: '',
  });

  // Handle success with useEffect to avoid setState during render
  useEffect(() => {
    if (state.success && !isPending) {
      onUpdate();
    }
  }, [state.success, isPending, onUpdate]);

  return (
    <div className='mb-4'>
      <form action={formAction} className='space-y-4'>
        <input type='hidden' name='id' value={comment.id} />

        <div>
          <textarea
            name='content'
            defaultValue={comment.content}
            className='w-full px-3 py-2 border border-gray-200 focus:border-gray-400 focus:outline-none bg-white text-gray-900 resize-vertical min-h-[80px]'
            disabled={isPending}
            required
          />
        </div>

        {!!state.error && (
          <div className='text-sm text-red-600 p-3 border border-red-200 bg-red-50'>{state.message}</div>
        )}

        <div className='flex items-center gap-3'>
          <button
            type='button'
            onClick={onCancel}
            disabled={isPending}
            className='text-sm text-gray-600 hover:text-gray-900 transition-colors'
          >
            ləğv et
          </button>
          <button
            type='submit'
            disabled={isPending}
            className='text-sm text-gray-600 hover:text-gray-900 transition-colors border border-gray-200 hover:border-gray-400 px-4 py-2 bg-white hover:bg-gray-50'
          >
            {isPending ? 'düzəliş edilir...' : 'düzəliş et'}
          </button>
        </div>
      </form>
    </div>
  );
}
