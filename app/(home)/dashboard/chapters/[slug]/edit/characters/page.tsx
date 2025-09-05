import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { ChapterCharactersForm } from './form';
import { getChapter } from '@/lib/fetchers';

interface ChapterCharactersPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ChapterCharactersPageProps): Promise<Metadata> {
  const { slug } = await params;
  const chapter = await getChapter(slug);

  if (!chapter) {
    return {
      title: 'Chapter Not Found',
    };
  }

  return {
    title: `Manage Characters - ${chapter.title}`,
    description: `Manage character appearances in ${chapter.title}`,
  };
}

export default async function ChapterCharactersPage({ params }: ChapterCharactersPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    notFound();
  }

  const { slug } = await params;
  const chapter = await getChapter(slug);

  if (!chapter) {
    notFound();
  }

  // Check if user is the author
  if (chapter.authorId !== session.user.id) {
    notFound();
  }

  return (
    <div className='min-h-screen bg-white'>
      <div className='max-w-4xl mx-auto px-4 py-8'>
        {/* Header */}
        <div className='text-center mb-12'>
          <Link
            href={`/dashboard/chapters/${chapter.slug}/edit`}
            className='text-sm text-gray-500 hover:text-gray-700 transition-colors'
          >
            ← back to edit chapter
          </Link>

          <h1 className='text-6xl font-serif text-gray-900 mt-6 mb-4'>Manage Characters</h1>
          <p className='text-sm text-gray-600 mb-8'>{chapter.title}</p>
        </div>

        {/* Form */}
        <div className='max-w-4xl mx-auto'>
          <ChapterCharactersForm chapter={chapter} />
        </div>
      </div>
    </div>
  );
}
