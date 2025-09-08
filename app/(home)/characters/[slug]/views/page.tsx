import { getViewsOfCharacter } from '@/lib/fetchers';
import { formatDistanceToNow } from 'date-fns';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface CharacterFavoritesPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CharacterFavoritesPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getViewsOfCharacter(slug);

  if (!data) {
    return {
      title: 'baxışlar tapılmadı',
    };
  }

  const { character, views } = data;

  const title = `${character.name} baxışları (${views.length})`;
  const description = `"${character.name}" personajının baxışları. ${views.length} şəxs bu personaja baxmışdır.`;
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/characters/${slug}/views`;

  return {
    title,
    description,
    keywords: ['baxış', 'baxışlar', 'personaj', character.name],
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
    bookmarks: ['baxış', 'baxışlar', 'personaj', character.name],
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
  const data = await getViewsOfCharacter(slug);

  if (!data) {
    notFound();
  }

  const { character, views } = data;

  const userViews = views.filter((view) => view.user !== null) as {
    user: { slug: string; name: string };
    createdAt: Date;
  }[];

  // Group userViews by user.slug, collecting all createdAt dates for each user
  const groupedUserViews: {
    user: { slug: string; name: string };
    createdAts: Date[];
  }[] = Object.values(
    userViews.reduce(
      (acc, view) => {
        const slug = view.user.slug;
        if (!acc[slug]) {
          acc[slug] = {
            user: view.user,
            createdAts: [],
          };
        }
        acc[slug].createdAts.push(view.createdAt);
        return acc;
      },
      {} as Record<string, { user: { slug: string; name: string }; createdAts: Date[] }>
    )
  );

  const anonymousViewLength = views.length - userViews.length;

  return (
    <div className='min-h-screen bg-white'>
      <div className='text-center mb-16'>
        <Link
          href={`/characters/${character.slug}`}
          className='text-sm text-gray-500 hover:text-gray-700 transition-colors'
        >
          ← personaja qayıt
        </Link>

        <h1 className='text-4xl font-serif text-gray-900 mt-8 mb-2'>{character.name} baxışları</h1>
      </div>
      <div className='max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {groupedUserViews.map((view) => (
          <div
            key={view.user.slug}
            className='border border-gray-200 hover:border-gray-400 transition-colors p-6 bg-white flex flex-col group'
          >
            <div className='flex items-center gap-2'>
              <Link href={`/users/${view.user.slug}`} className='hover:text-gray-900 hover:underline transition-colors'>
                {view.user.name}
              </Link>
              <span className='text-xs text-gray-500'>({view.createdAts.length} baxış)</span>
            </div>
            <div className='mb-1 text-xs text-gray-500'>
              son baxış: {formatDistanceToNow(new Date(view.createdAts[0]))} əvvəl
            </div>
          </div>
        ))}
      </div>
      {anonymousViewLength > 0 && (
        <div className='max-w-4xl mx-auto transition-colors mt-4 bg-white flex flex-col group'>
          <div className='text-xs text-gray-500'>+{anonymousViewLength} anonim baxış</div>
        </div>
      )}
    </div>
  );
}
