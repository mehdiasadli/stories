import { TChapter } from '@/lib/schemas/chapter.schema';
import { TUser } from '@/lib/schemas/user.schema';
import { calculateReadingTime } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface ChapterCardProps {
  chapter: TChapter & {
    _count: {
      reads: number;
      favorites: number;
      comments: number;
    };
    author: Pick<TUser, 'name' | 'slug'>;
  };
}

export function ChapterCard({ chapter }: ChapterCardProps) {
  const estimatedReadTime = chapter.content ? calculateReadingTime(chapter.content) : null;

  return (
    <Link href={`/chapters/${chapter.slug}`}>
      <article className='border border-gray-200 hover:border-gray-400 transition-colors p-6 bg-white flex flex-col group h-[260px]'>
        <div className='flex items-center justify-between mb-4'>
          <span className='text-xs text-gray-700 bg-white border border-gray-300 px-2 py-1'>
            ~{estimatedReadTime} dəq. oxuma
          </span>
          {chapter.publishedAt ? (
            <span className='text-xs text-gray-500'>
              {formatDistanceToNow(new Date(chapter.publishedAt))} əvvəl yayımlandı
            </span>
          ) : (
            <span className='text-xs text-gray-500'>{chapter.status}</span>
          )}
        </div>

        <h3 className='text-lg font-serif text-gray-900 mb-3 group-hover:text-gray-700 transition-colors'>
          {chapter.order}. {chapter.title}
        </h3>

        {chapter.synopsis && (
          <p className='text-xs text-gray-500 leading-relaxed mb-4'>
            {chapter.synopsis.length > 250 ? chapter.synopsis.slice(0, 250) + '...' : chapter.synopsis}
          </p>
        )}

        <div className='mt-auto pt-4 border-t border-gray-100 flex items-center justify-between'>
          <p className='text-xs text-gray-500'>{chapter._count.reads} oxuma</p>
          <p className='text-xs text-gray-500'>•</p>
          <p className='text-xs text-gray-500'>{chapter._count.favorites} favorit</p>
          <p className='text-xs text-gray-500'>•</p>
          <p className='text-xs text-gray-500'>{chapter._count.comments} şərh</p>
        </div>
      </article>
    </Link>
  );
}
