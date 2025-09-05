import './chapter-content.css';

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { calculateReadingTime } from '@/lib/utils';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ChapterShareOptions } from './share-options';
import { ChapterActions } from './chapter-actions';
import { ChapterActionsButtons } from './chapter-actions-buttons';
import { getAllChapters, getChapter } from '@/lib/fetchers';

export const revalidate = 300; // 5 minutes
export const dynamicParams = true; // Allow dynamic params for newly published chapters

export async function generateStaticParams() {
  const chapters = await getAllChapters();

  return chapters.map((chapter) => ({
    slug: chapter.slug,
  }));
}

export async function generateMetadata({ params }: ChapterPageProps): Promise<Metadata> {
  const { slug } = await params;

  const chapter = await getChapter(slug);

  if (!chapter) {
    return {
      title: 'Tapılmadı',
    };
  }

  const openGraphTitle = `"${chapter.title}" bölümünü oxu ("mahmud")`;
  const synopsis = chapter.synopsis || 'məlumat yoxdur';

  return {
    title: chapter.title,
    description: synopsis,
    keywords: ['bölüm', 'bölüm oxu', 'mahmud', `bölüm ${chapter.order}`, chapter.title, chapter.synopsis].filter(
      Boolean
    ) as string[],
    twitter: {
      title: openGraphTitle,
      description: synopsis,
      card: 'summary_large_image',
    },
    pinterest: {
      richPin: true,
    },
    openGraph: {
      title: openGraphTitle,
      type: 'website',
      description: synopsis,
      url: `${process.env.NEXT_PUBLIC_APP_URL}/${slug}`,
    },
    bookmarks: ['mahmud', chapter.title, chapter.synopsis].filter(Boolean) as string[],
    appLinks: {
      web: {
        url: `${process.env.NEXT_PUBLIC_APP_URL}/${slug}`,
      },
    },
    category: 'Reading',
  };
}

interface ChapterPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ChapterPage({ params }: ChapterPageProps) {
  const { slug } = await params;

  const chapter = await getChapter(slug);

  if (!chapter) {
    notFound();
  }

  const allChapters = (await getAllChapters()).sort((a, b) => a.order - b.order);

  // Find the current chapter by slug
  const currentOrder = chapter.order;

  // Find previous chapter: chapter with order = currentOrder - 1
  const previousChapter = allChapters.find((c) => c.order === currentOrder - 1) || null;

  // Find next chapter: chapter with order = currentOrder + 1
  const nextChapter = allChapters.find((c) => c.order === currentOrder + 1) || null;
  const readingTime = calculateReadingTime(chapter.wordCount);

  return (
    <div className='min-h-screen bg-white'>
      <div className='max-w-4xl mx-auto px-4 py-8'>
        {/* Header */}
        <div className='text-center mb-16'>
          <Link href={`/`} className='text-sm text-gray-500 hover:text-gray-700 transition-colors'>
            ← bölümlər
          </Link>

          <h1 className='text-6xl font-serif text-gray-900 mt-8 mb-2'>{chapter.title}</h1>

          <p className='text-sm text-gray-500'>
            bölüm #{chapter.order} • {readingTime} dəq. oxuma
          </p>
        </div>

        {/* Content */}
        <div className='prose prose-lg max-w-none'>
          <div
            className='chapter-content'
            dangerouslySetInnerHTML={{ __html: chapter.content || '<p>kontent yoxdur.</p>' }}
          />
        </div>

        {/* Chapter Actions Buttons */}
        <ChapterActionsButtons chapterSlug={slug} />

        {/* Footer */}
        <div className='mt-16 pt-8 border-t border-gray-200 text-center space-y-6'>
          {/* Quick Actions */}
          <div className='flex items-center justify-center gap-6 text-sm'>
            <Link
              href={`/chapters/${slug}/discussion`}
              className='text-gray-600 hover:text-gray-900 transition-colors border-b border-gray-200 hover:border-gray-400 pb-1'
            >
              {chapter._count.comments} şərh
            </Link>

            <Link
              href={`/chapters/${slug}/download`}
              className='text-gray-600 hover:text-gray-900 transition-colors border-b border-gray-200 hover:border-gray-400 pb-1'
            >
              yüklə
            </Link>

            <ChapterActions chapterSlug={slug} authorId={chapter.authorId} />

            {chapter.status === 'PUBLISHED' && (
              <ChapterShareOptions
                chapterTitle={chapter.title}
                chapterUrl={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/chapters/${slug}`}
              />
            )}
          </div>

          {/* Chapter Navigation */}
          <div className='pt-4 border-t border-gray-200'>
            <div className='flex items-center justify-center gap-8'>
              {previousChapter ? (
                <Link
                  href={`/chapters/${previousChapter.slug}`}
                  className='text-sm text-gray-600 hover:text-gray-900 transition-colors'
                >
                  ← {previousChapter.title}
                </Link>
              ) : (
                <span className='text-sm text-gray-400'>← əvvəlki</span>
              )}

              {nextChapter ? (
                <Link
                  href={`/chapters/${nextChapter.slug}`}
                  className='text-sm text-gray-600 hover:text-gray-900 transition-colors'
                >
                  {nextChapter.title} →
                </Link>
              ) : (
                <span className='text-sm text-gray-400'>növbəti →</span>
              )}
            </div>
          </div>

          {/* Metadata */}
          <div className='pt-4 border-t border-gray-200 text-xs text-gray-500 space-y-1'>
            <div>
              {chapter.wordCount} söz • {chapter._count.reads} oxuma • {chapter._count.favorites} favorit
            </div>
            <div>
              <Link href={`/users/${chapter.author.slug}`} className='hover:text-gray-700 transition-colors'>
                {chapter.author.name}
              </Link>
            </div>
            {chapter.publishedAt && <div>{formatDistanceToNow(new Date(chapter.publishedAt))} əvvəl yayımlandı</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
