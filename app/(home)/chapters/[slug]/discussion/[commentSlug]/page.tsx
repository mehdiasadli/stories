import { getComment } from '@/lib/fetchers';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CommentsSection } from '../comments-section';
import { auth } from '@/lib/auth';
import { createComment, deleteComment, updateComment } from '@/lib/actions/comment.actions';

export async function generateMetadata({ params }: { params: Promise<{ commentSlug: string }> }) {
  const { commentSlug } = await params;
  const comment = await getComment(commentSlug);

  if (!comment) {
    return {
      title: 'Şərh tapılmadı',
    };
  }

  const title = `${comment.user.name} kommenti ${comment.content.slice(0, 12)}...`;
  const description = comment.content;
  const keywords = [comment.user.name, comment.content, comment.chapter.title];
  const openGraph = {
    title,
    description,
    keywords,
    url: `${process.env.NEXT_PUBLIC_APP_URL}/chapters/${comment.chapter.slug}/discussion/${commentSlug}`,
    type: 'website',
  };
  const twitter = {
    title,
    description,
    card: 'summary_large_image',
  };

  return {
    title,
    description,
    keywords,
    openGraph,
    twitter,
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_APP_URL}/chapters/${comment.chapter.slug}/discussion/${commentSlug}`,
    },
    bookmarks: ['şərh', 'diskusiya', comment.user.name, comment.content, comment.chapter.title],
    appLinks: {
      web: {
        url: `${process.env.NEXT_PUBLIC_APP_URL}/chapters/${comment.chapter.slug}/discussion/${commentSlug}`,
      },
    },
    category: 'Reading',
  };
}

export default async function CommentPage({ params }: { params: Promise<{ commentSlug: string }> }) {
  const { commentSlug } = await params;
  const comment = await getComment(commentSlug);
  const session = await auth();

  if (!comment) {
    notFound();
  }

  return (
    <div className='min-h-screen bg-white'>
      <div className='max-w-4xl mx-auto px-4 py-8'>
        {/* Header */}
        <div className='text-center mb-12'>
          <Link
            href={`/chapters/${comment.chapter.slug}/discussion`}
            className='text-sm text-gray-500 hover:text-gray-700 transition-colors'
          >
            ← {comment.chapter.title} bölümünün diskusiyası
          </Link>

          <h1 className='text-6xl font-serif text-gray-900 mt-8 mb-4'>Diskusiya</h1>

          <div className='text-sm text-gray-600 space-y-1'>
            <div>{comment.chapter.title}</div>
            <div className='text-gray-500'>
              bölüm #{comment.chapter.order} • {comment.chapter._count.comments} şərh
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className='max-w-3xl mx-auto'>
          <CommentsSection
            chapterSlug={comment.chapter.slug}
            chapterTitle={comment.chapter.title}
            initialComments={[comment]}
            currentUserId={session?.user?.id}
            chapterAuthorId={comment.chapter.authorId}
            singleComment
            createCommentAction={createComment}
            deleteCommentAction={deleteComment}
            updateCommentAction={updateComment}
          />
        </div>
      </div>
    </div>
  );
}
