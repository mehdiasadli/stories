import { auth } from '@/lib/auth';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CommentsSection } from './comments-section';
import { createComment, deleteComment, updateComment } from '@/lib/actions/comment.actions';
import { Metadata } from 'next';
import { getChapter, getInitialComments } from '@/lib/fetchers';

interface ChapterDiscussionPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ChapterDiscussionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const chapter = await getChapter(slug);

  if (!chapter) {
    return {
      title: 'Şərhlər tapılmadı',
    };
  }

  return {
    title: `${chapter.title} diskusiyası (${chapter._count.comments})`,
    description: `"${chapter.title}" bölümünün diskusiyası. Diskusiyada ${chapter._count.comments} şərh var.`,
    keywords: ['diskusiya', 'şərh', 'bölüm', chapter.title],
    openGraph: {
      title: `${chapter.title} diskusiyası (${chapter._count.comments})`,
      description: `"${chapter.title}" bölümünün diskusiyası. Diskusiyada ${chapter._count.comments} şərh var.`,
      url: `${process.env.NEXT_PUBLIC_APP_URL}/chapters/${slug}/discussion`,
      type: 'website',
    },
    twitter: {
      title: `${chapter.title} diskusiyası (${chapter._count.comments})`,
      description: `"${chapter.title}" bölümünün diskusiyası. Diskusiyada ${chapter._count.comments} şərh var.`,
      card: 'summary_large_image',
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_APP_URL}/chapters/${slug}/discussion`,
    },
    bookmarks: ['diskusiya', 'şərh', 'bölüm', chapter.title],
    appLinks: {
      web: {
        url: `${process.env.NEXT_PUBLIC_APP_URL}/chapters/${slug}/discussion`,
      },
    },
    category: 'Reading',
  };
}

export default async function ChapterDiscussionPage({ params }: ChapterDiscussionPageProps) {
  const { slug } = await params;
  const chapter = await getChapter(slug);
  const session = await auth();

  if (!chapter) {
    notFound();
  }

  const initialComments = await getInitialComments(chapter.id);

  return (
    <div className='min-h-screen bg-white'>
      <div className='max-w-4xl mx-auto px-4 py-8'>
        {/* Header */}
        <div className='text-center mb-12'>
          <Link href={`/chapters/${slug}`} className='text-sm text-gray-500 hover:text-gray-700 transition-colors'>
            ← {chapter.title} bölümü
          </Link>

          <h1 className='text-6xl font-serif text-gray-900 mt-8 mb-4'>Diskusiya</h1>

          <div className='text-sm text-gray-600 space-y-1'>
            <div>{chapter.title}</div>
            <div className='text-gray-500'>
              bölüm #{chapter.order} • {chapter._count.comments} şərh
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className='max-w-3xl mx-auto'>
          <CommentsSection
            chapterSlug={slug}
            chapterTitle={chapter.title}
            initialComments={initialComments}
            currentUserId={session?.user?.id}
            chapterAuthorId={chapter.authorId}
            createCommentAction={createComment}
            deleteCommentAction={deleteComment}
            updateCommentAction={updateComment}
          />
        </div>
      </div>
    </div>
  );
}
