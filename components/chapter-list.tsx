import { SearchBar } from '@/components/search-bar';
import { ChapterSearchSchema, TChapterSearch } from '@/lib/schemas/chapter.schema';
import { Pagination } from '@/components/pagination';
import { ChapterCard } from '@/components/chapter-card';
import Link from 'next/link';
import { getChapters } from '@/lib/fetchers';
import { Suspense } from 'react';

interface ChapterListProps {
  searchParams: Promise<Partial<TChapterSearch>>;
  dashboard?: boolean;
}

export async function ChapterList({ searchParams, dashboard }: ChapterListProps) {
  const resolvedSearchParams = await searchParams;

  // Parse search params with proper handling for status array
  let parsedParams: TChapterSearch;

  if (resolvedSearchParams.status) {
    // Handle status as array from URL params
    const statusArray = Array.isArray(resolvedSearchParams.status)
      ? resolvedSearchParams.status
      : [resolvedSearchParams.status];

    const { data } = ChapterSearchSchema.safeParse({
      ...resolvedSearchParams,
      status: statusArray,
    });
    parsedParams = data ?? ChapterSearchSchema.parse({});
  } else {
    const { data } = ChapterSearchSchema.safeParse(resolvedSearchParams);
    parsedParams = data ?? ChapterSearchSchema.parse({});
  }

  const { chapters, pagination } = await getChapters(parsedParams, dashboard);

  return (
    <div>
      {dashboard && (
        <div className='flex flex-col gap-4'>
          <div className='mx-auto'>
            <div className='flex items-center justify-center gap-4'>
              <Link href='/dashboard/chapters/create' className='mb-4 underline text-gray-500'>
                Create Chapter
              </Link>
              <Link href='/dashboard/characters' className='mb-4 underline text-gray-500'>
                Go to characters
              </Link>
            </div>
          </div>
          <div className='mx-auto w-full'>
            <Suspense>
              <SearchBar dashboard />
            </Suspense>
          </div>
        </div>
      )}

      {!dashboard && (
        <Suspense>
          <SearchBar />
        </Suspense>
      )}

      {chapters.length === 0 && (
        <div className='max-w-2xl mx-auto'>
          <p className='text-center text-gray-500'>bölüm tapılmadı</p>
        </div>
      )}

      <div className='max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4'>
        {chapters.map((chapter) => (
          <ChapterCard chapter={chapter} key={chapter.id} />
        ))}
      </div>
      <Suspense>
        <Pagination dashboard={dashboard} pagination={pagination} />
      </Suspense>
    </div>
  );
}
