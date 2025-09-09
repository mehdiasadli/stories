import { Pagination } from '@/components/pagination';
import { getChaptersOfUser, getProfileUser } from '@/lib/fetchers';
import { ChapterSearchOfUserSchema, TChapterSearchOfUser } from '@/lib/schemas/chapter.schema';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

interface UserCommentsPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<TChapterSearchOfUser>;
}

export default async function UserCommentsPage({ params, searchParams }: UserCommentsPageProps) {
  const { slug } = await params;
  const { page } = await searchParams;

  const profileUser = await getProfileUser(slug);

  if (!profileUser) {
    notFound();
  }

  const parsedSearchParams = ChapterSearchOfUserSchema.parse({ page });
  const { chapters, pagination } = await getChaptersOfUser(profileUser.id, 'comments', parsedSearchParams);

  return (
    <>
      {chapters.length === 0 ? (
        <div className='max-w-2xl mx-auto'>
          <p className='text-center text-gray-500'>{profileUser.name} heç bir bölümə şərh etməyib</p>
        </div>
      ) : (
        <div>
          <div className='max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4'>
            {chapters.map((c) => (
              <Link
                key={c.id}
                href={`/chapters/${c.slug}/comments/${c.comments[0].slug}`}
                className='border border-gray-200 hover:border-gray-400 transition-colors p-6 bg-white flex flex-col group'
              >
                <div className='border-b border-gray-200 mb-6 last:border-b-0 last:mb-0'>
                  {/* Comment Header */}
                  <div className='flex justify-between items-start mb-3'>
                    <div className='flex items-center gap-3'>
                      <div className='w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium text-gray-700'>
                        {c.comments[0].user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className='flex items-center gap-2'>
                          <p className='text-sm text-gray-900 hover:text-gray-700 transition-colors'>
                            {c.comments[0].user.name}
                          </p>
                        </div>
                        <div className='text-xs text-gray-500'>
                          {formatDistanceToNow(new Date(c.comments[0].createdAt))} əvvəl
                          {c.comments[0].updatedAt > c.comments[0].createdAt && ' (düzəliş)'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className='text-gray-800 text-sm leading-relaxed'>
                    <p className='whitespace-pre-wrap'>{c.comments[0].content}</p>
                  </div>
                </div>
              </Link>
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
