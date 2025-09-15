'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteChapter } from '@/lib/actions/chapter.actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import Link from 'next/link';

interface DeleteChapterFormProps {
  chapter: {
    slug: string;
    title: string;
  };
}

export function DeleteChapterForm({ chapter }: DeleteChapterFormProps) {
  const [titleInput, setTitleInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (titleInput !== chapter.title) {
      toast.error('Chapter title does not match');
      return;
    }

    setIsDeleting(true);

    try {
      const formData = new FormData();
      formData.append('slug', chapter.slug);
      formData.append('title', chapter.title);

      const result = await deleteChapter(formData);

      if (result.success) {
        toast.success('Chapter deleted successfully');
        router.push('/dashboard/chapters');
        router.refresh();
      } else {
        toast.error(result.message || 'Failed to delete chapter');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsDeleting(false);
    }
  };

  const isFormValid = titleInput === chapter.title;

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      <div>
        <Label htmlFor='title' className='block text-sm font-medium text-gray-700 mb-2'>
          To confirm deletion, type the chapter title exactly: <span className='font-semibold'>{chapter.title}</span>
        </Label>
        <Input
          id='title'
          type='text'
          value={titleInput}
          onChange={(e) => setTitleInput(e.target.value)}
          placeholder='Type the chapter title here'
          className='w-full'
          required
          disabled={isDeleting}
        />
        {titleInput && titleInput !== chapter.title && (
          <p className='mt-1 text-sm text-red-600'>Title does not match</p>
        )}
        {titleInput === chapter.title && <p className='mt-1 text-sm text-green-600'>Title matches</p>}
      </div>

      <div className='flex items-center justify-between pt-4 border-t border-gray-200'>
        <Link
          href={`/chapters/${chapter.slug}`}
          className='inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
        >
          Cancel
        </Link>

        <Button type='submit' variant='destructive' disabled={!isFormValid || isDeleting} className='min-w-[120px]'>
          {isDeleting ? (
            <>
              <svg
                className='animate-spin -ml-1 mr-2 h-4 w-4 text-white'
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
              >
                <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                <path
                  className='opacity-75'
                  fill='currentColor'
                  d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                ></path>
              </svg>
              Deleting...
            </>
          ) : (
            'Delete Chapter'
          )}
        </Button>
      </div>
    </form>
  );
}
