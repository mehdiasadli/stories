import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { DeleteChapterForm } from './delete-form';
import { getChapter } from '@/lib/fetchers';

export const metadata: Metadata = {
  title: 'Delete Chapter',
  description: 'Delete a chapter permanently',
};

interface DeleteChapterPageProps {
  params: Promise<{ slug: string }>;
}

export default async function DeleteChapterPage({ params }: DeleteChapterPageProps) {
  const { slug } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/auth/login');
  }

  const chapter = await getChapter(slug);

  if (!chapter) {
    notFound();
  }

  // Only the author can delete the chapter
  if (chapter.authorId !== session.user.id) {
    redirect(`/chapters/${slug}`);
  }

  return (
    <div className='min-h-screen bg-gray-50 py-12'>
      <div className='max-w-2xl mx-auto px-4'>
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-8'>
          <div className='mb-8'>
            <h1 className='text-2xl font-bold text-gray-900 mb-2'>Delete Chapter</h1>
            <p className='text-gray-600'>
              You are about to permanently delete this chapter. This action cannot be undone.
            </p>
          </div>

          <div className='bg-red-50 border border-red-200 rounded-lg p-4 mb-6'>
            <div className='flex'>
              <div className='flex-shrink-0'>
                <svg className='h-5 w-5 text-red-400' viewBox='0 0 20 20' fill='currentColor'>
                  <path
                    fillRule='evenodd'
                    d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                    clipRule='evenodd'
                  />
                </svg>
              </div>
              <div className='ml-3'>
                <h3 className='text-sm font-medium text-red-800'>Warning</h3>
                <div className='mt-2 text-sm text-red-700'>
                  <p>This will permanently delete:</p>
                  <ul className='list-disc list-inside mt-1'>
                    <li>The chapter content and all associated data</li>
                    <li>All comments and discussions</li>
                    <li>All favorites and reading history</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className='bg-gray-50 rounded-lg p-4 mb-6'>
            <h3 className='font-medium text-gray-900 mb-2'>Chapter Details</h3>
            <div className='space-y-1 text-sm text-gray-600'>
              <p>
                <span className='font-medium'>Title:</span> {chapter.title}
              </p>
              <p>
                <span className='font-medium'>Order:</span> #{chapter.order}
              </p>
              <p>
                <span className='font-medium'>Status:</span> {chapter.status}
              </p>
              <p>
                <span className='font-medium'>Word Count:</span> {chapter.wordCount} words
              </p>
              {chapter.synopsis && (
                <p>
                  <span className='font-medium'>Synopsis:</span> {chapter.synopsis}
                </p>
              )}
            </div>
          </div>

          <DeleteChapterForm chapter={chapter} />
        </div>
      </div>
    </div>
  );
}
