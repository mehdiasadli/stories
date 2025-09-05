import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Metadata } from 'next';
import { ChapterDownloadOptions } from './download-options';

interface DownloadPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: DownloadPageProps): Promise<Metadata> {
  const { slug } = await params;

  const chapter = await prisma.chapter.findUnique({
    where: { slug },
    select: { title: true },
  });

  if (!chapter) {
    return { title: 'Bölüm Yüklə', description: 'Bölüm yüklə' };
  }

  return {
    title: `${chapter.title} bölümünü yüklə`,
    description: `"${chapter.title}" bölümünü yüklə ("mahmud")`,
    keywords: ['download', 'chapter', chapter.title],
    openGraph: {
      title: `${chapter.title} bölümünü yüklə`,
      description: `"${chapter.title}" bölümünü yüklə ("mahmud")`,
      url: `${process.env.NEXT_PUBLIC_APP_URL}/chapters/${slug}/download`,
      type: 'website',
    },
    twitter: {
      title: `${chapter.title} bölümünü yüklə`,
      description: `"${chapter.title}" bölümünü yüklə ("mahmud")`,
      card: 'summary_large_image',
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_APP_URL}/chapters/${slug}/download`,
    },
    bookmarks: ['yüklə', 'bölüm', chapter.title],
    appLinks: {
      web: {
        url: `${process.env.NEXT_PUBLIC_APP_URL}/chapters/${slug}/download`,
      },
    },
    category: 'Reading',
  };
}

export default async function DownloadPage({ params }: DownloadPageProps) {
  const { slug } = await params;

  const chapter = await prisma.chapter.findUnique({
    where: {
      slug,
    },
    include: {
      author: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!chapter) {
    redirect('/chapters');
  }

  return (
    <div className='min-h-screen bg-white'>
      <div className='max-w-4xl mx-auto px-4 py-8'>
        {/* Header */}
        <div className='text-center mb-12'>
          <Link href={`/chapters/${slug}`} className='text-sm text-gray-500 hover:text-gray-700 transition-colors'>
            ← bölümə qayıt
          </Link>

          <h1 className='text-6xl font-serif text-gray-900 mt-8 mb-4'>yüklə</h1>

          <div className='text-sm text-gray-600 space-y-1'>
            <div>{chapter.title}</div>
            <div className='text-gray-500'>
              {chapter.title} • {chapter.author.name}
            </div>
          </div>
        </div>

        {/* Download Options */}
        <div className='max-w-2xl mx-auto'>
          <ChapterDownloadOptions
            chapter={{
              id: chapter.id,
              title: chapter.title,
              content: chapter.content,
              order: chapter.order,
              slug: chapter.slug,
              author: chapter.author,
            }}
          />
        </div>
      </div>
    </div>
  );
}
