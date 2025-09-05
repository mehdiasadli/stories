import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { DeleteCharacterForm } from './delete-form';
import { getAuthorId, getCharacter } from '@/lib/fetchers';

export const metadata: Metadata = {
  title: 'Delete Character',
  description: 'Delete a character permanently',
};

interface DeleteCharacterPageProps {
  params: Promise<{ slug: string }>;
}

export default async function DeleteCharacterPage({ params }: DeleteCharacterPageProps) {
  const { slug } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/auth/login');
  }

  const character = await getCharacter(slug);
  const authorId = await getAuthorId();

  if (!character || !authorId) {
    notFound();
  }

  // Only the author can delete the chapter
  if (authorId !== session.user.id) {
    redirect(`/characters/${slug}`);
  }

  return (
    <div className='min-h-screen bg-gray-50 py-12'>
      <div className='max-w-2xl mx-auto px-4'>
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-8'>
          <div className='mb-8'>
            <h1 className='text-2xl font-bold text-gray-900 mb-2'>delete character</h1>
            <p className='text-gray-600'>
              you are about to permanently delete this character. this action cannot be undone.
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
                <h3 className='text-sm font-medium text-red-800'>warning</h3>
                <div className='mt-2 text-sm text-red-700'>
                  <p>this will permanently delete:</p>
                  <ul className='list-disc list-inside mt-1'>
                    <li>the character wiki and all associated data</li>
                    <li>all chapter appearances</li>
                    <li>all relations with other characters</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className='bg-gray-50 rounded-lg p-4 mb-6'>
            <h3 className='font-medium text-gray-900 mb-2'>character details</h3>
            <div className='space-y-1 text-sm text-gray-600'>
              <p>
                <span className='font-medium'>name:</span> {character.name}
              </p>
              <p>
                <span className='font-medium'>name description:</span> {character.nameDescription || 'none'}
              </p>
              <p>
                <span className='font-medium'>description:</span> {character.description || 'none'}
              </p>
            </div>
          </div>

          <DeleteCharacterForm character={character} />
        </div>
      </div>
    </div>
  );
}
