import { ChapterCard } from '@/components/chapter-card';
import { Pagination } from '@/components/pagination';
import { getChaptersOfUser, getProfileUser } from '@/lib/fetchers';
import { ChapterSearchOfUserSchema, TChapterSearchOfUser } from '@/lib/schemas/chapter.schema';
import { formatDistanceToNow } from 'date-fns';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

interface UserFavoritesPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<TChapterSearchOfUser>;
}

export default async function UserFavoritesPage({ params, searchParams }: UserFavoritesPageProps) {
  const { slug } = await params;
  const { page } = await searchParams;

  const profileUser = await getProfileUser(slug);

  if (!profileUser || !profileUser.isVerified) {
    notFound();
  }

  const parsedSearchParams = ChapterSearchOfUserSchema.parse({ page });
  const { chapters, pagination } = await getChaptersOfUser(profileUser.id, 'favorites', parsedSearchParams);

  return (
    <>
      {chapters.length === 0 ? (
        <div className='max-w-2xl mx-auto'>
          <p className='text-center text-gray-500'>{profileUser.name} heç bir bölümü favorit etməyib</p>
        </div>
      ) : (
        <div>
          <div className='max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4'>
            {chapters.map((c) => (
              <div key={c.id}>
                <div className='mb-1 text-xs text-gray-500'>
                  {formatDistanceToNow(new Date(c.favorites[0].createdAt))} əvvəl
                </div>
                <ChapterCard chapter={c} />
              </div>
            ))}
          </div>

          <Suspense>
            <Pagination pagination={pagination} userSlug={slug} resource='favorites' />
          </Suspense>
        </div>
      )}
    </>
  );
}
