import { getFavoritesOfCharacter } from '@/lib/fetchers';
import { formatDistanceToNow } from 'date-fns';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface CharacterFavoritesPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CharacterFavoritesPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getFavoritesOfCharacter(slug);

  if (!data) {
    return {
      title: 'favoritlər tapılmadı',
    };
  }

  const { character, favorites } = data;

  const title = `${character.name} favoritləri (${favorites.length})`;
  const description = `"${character.name}" personajının favoritləri. ${favorites.length} şəxs bu personajı favorit etmişdir.`;
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/characters/${slug}/favorites`;

  return {
    title,
    description,
    keywords: ['favorit', 'favoritlər', 'personaj', character.name],
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
    bookmarks: ['favorit', 'favoritlər', 'personaj', character.name],
    appLinks: {
      web: {
        url,
      },
    },
    category: 'Reading',
  };
}

export default async function CharacterFavoritesPage({ params }: CharacterFavoritesPageProps) {
  const { slug } = await params;
  const data = await getFavoritesOfCharacter(slug);

  if (!data) {
    notFound();
  }

  const { character, favorites } = data;

  return (
    <div className='min-h-screen bg-white'>
      <div className='text-center mb-16'>
        <Link
          href={`/characters/${character.slug}`}
          className='text-sm text-gray-500 hover:text-gray-700 transition-colors'
        >
          ← personaja qayıt
        </Link>

        <h1 className='text-4xl font-serif text-gray-900 mt-8 mb-2'>{character.name} favoritləri</h1>
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
