import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import { EditChapterForm } from './form';
import { getChapter } from '@/lib/fetchers';

export const metadata: Metadata = {
  title: 'Edit Chapter',
  description: 'Edit chapter details',
};

interface EditChapterPageProps {
  params: Promise<{ slug: string }>;
}

export default async function DashboardChapterEditPage({ params }: EditChapterPageProps) {
  const { slug } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/auth/login');
  }

  const chapter = await getChapter(slug);

  if (!chapter) {
    notFound();
  }

  // Only the author can edit the chapter
  if (chapter.authorId !== session.user.id) {
    redirect(`/chapters/${slug}`);
  }

  return (
    <div className='min-h-screen bg-white'>
      <div className='max-w-4xl mx-auto px-4 py-8'>
        {/* Header */}
        <div className='text-center mb-12'>
          <Link href={`/chapters/${slug}`} className='text-sm text-gray-500 hover:text-gray-700 transition-colors'>
            ← back to {chapter.title}
          </Link>

          <h1 className='text-6xl font-serif text-gray-900 mt-6 mb-4'>Edit Chapter</h1>

          <p className='text-sm text-gray-600 mb-8'>Update chapter details and settings</p>
        </div>

        {/* Form */}
        <div className='max-w-2xl mx-auto'>
          <EditChapterForm chapter={chapter} />
        </div>
      </div>
    </div>
  );
}
