'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

interface EditChapterFormProps {
  chapter: {
    slug: string;
    title: string;
    order: number;
    synopsis: string | null;
    status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
    coverImageUrl: string | null;
  };
}

export function EditChapterForm({ chapter }: EditChapterFormProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData(e.currentTarget);

      // Convert FormData to JSON object
      const data = {
        title: formData.get('title') as string,
        order: parseInt(formData.get('order') as string),
        status: formData.get('status') as string,
        synopsis: (formData.get('synopsis') as string) || null,
        coverImageUrl: (formData.get('coverImageUrl') as string) || null,
      };

      const response = await fetch(`/api/chapters/${chapter.slug}/edit`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSuccess(result.message || 'Chapter updated successfully');
        toast.success('Chapter updated successfully');

        // If slug changed, redirect to new URL
        if (result.data?.slug && result.data.slug !== chapter.slug) {
          router.push(`/dashboard/chapters/${result.data.slug}/edit`);
          router.refresh();
        } else {
          router.refresh();
        }
      } else {
        setError(result.error || 'Failed to update chapter');
        toast.error(result.error || 'Failed to update chapter');
      }
    } catch (error) {
      setError('An unexpected error occurred');
      toast.error('An unexpected error occurred');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className='space-y-6'>
        <div>
          <label className='block text-sm font-medium text-gray-900 mb-2'>chapter Title</label>
          <input
            type='text'
            placeholder='enter chapter title...'
            className='w-full px-4 py-3 text-sm border border-gray-200 rounded-none focus:outline-none focus:border-gray-400 bg-white'
            disabled={isPending}
            name='title'
            defaultValue={chapter.title}
            required
          />
        </div>

        {/* Order */}
        <div>
          <label className='block text-sm font-medium text-gray-900 mb-2'>chapter Order</label>
          <p className='text-sm text-gray-600 mb-2'>position of this chapter in the book</p>
          <input
            type='number'
            placeholder='enter chapter order...'
            className='w-full px-4 py-3 text-sm border border-gray-200 rounded-none focus:outline-none focus:border-gray-400 bg-white'
            disabled={isPending}
            min={1}
            name='order'
            defaultValue={chapter.order}
            required
          />
        </div>

        {/* Status */}
        <div>
          <label className='block text-sm font-medium text-gray-900 mb-2'>chapter Status</label>
          <p className='text-sm text-gray-600 mb-2'>publication status of this chapter</p>
          <div className='flex items-center gap-4'>
            <label className='flex items-center gap-2'>
              <input
                type='radio'
                name='status'
                value='DRAFT'
                defaultChecked={chapter.status === 'DRAFT'}
                disabled={isPending}
              />
              <span>Draft</span>
            </label>
            <label className='flex items-center gap-2'>
              <input
                type='radio'
                name='status'
                value='PUBLISHED'
                defaultChecked={chapter.status === 'PUBLISHED'}
                disabled={isPending}
              />
              <span>Published</span>
            </label>
            <label className='flex items-center gap-2'>
              <input
                type='radio'
                name='status'
                value='ARCHIVED'
                defaultChecked={chapter.status === 'ARCHIVED'}
                disabled={isPending}
              />
              <span>Archived</span>
            </label>
          </div>
        </div>

        {/* Synopsis */}
        <div>
          <label className='block text-sm font-medium text-gray-900 mb-2'>chapter synopsis</label>
          <p className='text-sm text-gray-600 mb-2'>brief description of this chapter (optional)</p>
          <textarea
            placeholder='brief description of this chapter...'
            className='w-full px-4 py-3 text-sm border border-gray-200 rounded-none focus:outline-none focus:border-gray-400 bg-white resize-none'
            rows={3}
            disabled={isPending}
            name='synopsis'
            defaultValue={chapter.synopsis || ''}
          />
        </div>

        {/* Cover Image URL - Placeholder */}
        <div>
          <label className='block text-sm font-medium text-gray-900 mb-2'>cover Image URL</label>
          <p className='text-sm text-gray-600 mb-2'>chapter cover image (optional - feature coming soon)</p>
          <input
            type='url'
            placeholder='https://example.com/image.jpg'
            className='w-full px-4 py-3 text-sm border border-gray-200 rounded-none focus:outline-none focus:border-gray-400 bg-gray-50'
            disabled={true}
            name='coverImageUrl'
            defaultValue={chapter.coverImageUrl || ''}
          />
          <p className='text-xs text-gray-500 mt-1'>Image upload functionality will be implemented later</p>
        </div>

        {!!error && <div className='text-sm text-red-600 p-3 border border-red-200 bg-red-50'>{error}</div>}

        {!!success && <div className='text-sm text-green-600 p-3 border border-green-200 bg-green-50'>{success}</div>}

        {/* Submit Button */}
        <div className='pt-4 border-t border-gray-200'>
          <button
            type='submit'
            className='w-full py-3 text-sm text-gray-600 hover:text-gray-900 transition-colors border border-gray-200 hover:border-gray-400 bg-white hover:bg-gray-50'
            disabled={isPending}
          >
            {isPending ? 'updating chapter...' : 'update chapter'}
          </button>
        </div>
      </form>
    </div>
  );
}
