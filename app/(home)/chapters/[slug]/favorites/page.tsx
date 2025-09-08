import { getFavoritesOfChapter } from '@/lib/fetchers';
import { formatDistanceToNow } from 'date-fns';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface ChapterFavoritesPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ChapterFavoritesPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getFavoritesOfChapter(slug);

  if (!data) {
    return {
      title: 'favoritlər tapılmadı',
    };
  }

  const { chapter, favorites } = data;

  const title = `${chapter.title} favoritləri (${favorites.length})`;
  const description = `"${chapter.title}" bölümünün favoritləri. ${favorites.length} şəxs bu bölümü favorit etmişdir.`;
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/chapters/${slug}/favorites`;

  return {
    title,
    description,
    keywords: ['favorit', 'favoritlər', 'bölüm', chapter.title],
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
    bookmarks: ['favorit', 'favoritlər', 'bölüm', chapter.title],
    appLinks: {
      web: {
        url,
      },
    },
    category: 'Reading',
  };
}

export default async function ChapterFavoritesPage({ params }: ChapterFavoritesPageProps) {
  const { slug } = await params;
  const data = await getFavoritesOfChapter(slug);

  if (!data) {
    notFound();
  }

  const { chapter, favorites } = data;

  return (
    <div className='min-h-screen bg-white'>
      <div className='text-center mb-16'>
        <Link
          href={`/chapters/${chapter.slug}`}
          className='text-sm text-gray-500 hover:text-gray-700 transition-colors'
        >
          ← bölümə qayıt
        </Link>

        <h1 className='text-4xl font-serif text-gray-900 mt-8 mb-2'>{chapter.title} favoritləri</h1>
      </div>
      <div className='max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {favorites.map((fav) => (
          <div
            key={fav.user.slug}
            className='border border-gray-200 hover:border-gray-400 transition-colors p-6 bg-white flex flex-col group'
          >
            <Link href={`/users/${fav.user.slug}`} className='hover:text-gray-900 hover:underline transition-colors'>
              {fav.user.name}
            </Link>
            <div className='mb-1 text-xs text-gray-500'>{formatDistanceToNow(new Date(fav.createdAt))} əvvəl</div>
          </div>
        ))}
      </div>
    </div>
  );
}
