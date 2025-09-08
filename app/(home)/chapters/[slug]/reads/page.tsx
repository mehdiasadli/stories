import { getReadersOfChapter } from '@/lib/fetchers';
import { formatDistanceToNow } from 'date-fns';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface ChapterReadsPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ChapterReadsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getReadersOfChapter(slug);

  if (!data) {
    return {
      title: 'oxuma tapılmadı',
    };
  }

  const { chapter, readers } = data;

  const title = `${chapter.title} oxucuları (${readers.length})`;
  const description = `"${chapter.title}" bölümünün oxucuları. ${readers.length} şəxs bu bölümü oxumuşdur.`;
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/chapters/${slug}/reads`;

  return {
    title,
    description,
    keywords: ['oxuma', 'oxucular', 'bölüm', chapter.title],
    openGraph: {
      title,
      description,
      url,
      type: 'website',
    },
    twitter: {
      title,
      description,
      card: 'summary_large_image',
    },
    alternates: {
      canonical: url,
    },
    bookmarks: ['oxuma', 'oxucular', 'bölüm', chapter.title],
    appLinks: {
      web: {
        url,
      },
    },
    category: 'Reading',
  };
}

export default async function ChapterReadsPage({ params }: ChapterReadsPageProps) {
  const { slug } = await params;
  const data = await getReadersOfChapter(slug);

  if (!data) {
    notFound();
  }

  const { chapter, readers } = data;

  return (
    <div className='min-h-screen bg-white'>
      <div className='text-center mb-16'>
        <Link
          href={`/chapters/${chapter.slug}`}
          className='text-sm text-gray-500 hover:text-gray-700 transition-colors'
        >
          ← bölümə qayıt
        </Link>

        <h1 className='text-4xl font-serif text-gray-900 mt-8 mb-2'>{chapter.title} oxucuları</h1>
      </div>
      <div className='max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {readers.map((reader) => (
          <div
            key={reader.user.slug}
            className='border border-gray-200 hover:border-gray-400 transition-colors p-6 bg-white flex flex-col group'
          >
            <Link href={`/users/${reader.user.slug}`} className='hover:text-gray-900 hover:underline transition-colors'>
              {reader.user.name}
            </Link>
            <div className='mb-1 text-xs text-gray-500'>{formatDistanceToNow(new Date(reader.createdAt))} əvvəl</div>
          </div>
        ))}
      </div>
    </div>
  );
}
