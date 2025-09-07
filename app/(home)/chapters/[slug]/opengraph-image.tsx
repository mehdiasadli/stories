import { getChapter } from '@/lib/fetchers';
import { format } from 'date-fns';
import { ImageResponse } from 'next/og';

export const size = {
  width: 1200,
  height: 630,
} as const;

interface OpengraphImageProps {
  params: Promise<{ slug: string }>;
}

export default async function OpengraphImage({ params }: OpengraphImageProps) {
  const { slug } = await params;
  const chapter = await getChapter(slug);

  return new ImageResponse(
    (
      <div
        className='w-full h-full relative flex flex-col'
        style={{
          background: 'radial-gradient(1200px 600px at 50% 40%, #f7f3e9 0%, #f1ecdf 60%, #ebe5d7 100%)',
          fontFamily: 'Times New Roman, Times, serif',
        }}
      >
        {/* Book header spacing */}
        <div className='px-12 pt-10' />

        {/* Content */}
        <div className='px-16 pb-24 flex-1 flex flex-col items-center text-[#2f2b24]'>
          <div className='w-full max-w-[900px] text-center'>
            <div className='text-[#6b6558] text-[34px] leading-none italic'>
              mahmud • bölüm #{!chapter ? '' : chapter.order}
            </div>
            <div className='mt-4 text-[#1f1b15] text-[64px] leading-[1.05] font-semibold tracking-tight line-clamp-3'>
              {chapter?.title || 'bölüm tapılmadı'}
            </div>
            <div className='mt-6 text-[#4a463f] text-[22px] leading-snug line-clamp-3'>
              {chapter?.synopsis || 'bu bölüm haqqında təsvir mövcud deyil.'}
            </div>
            <div className='mt-8 flex items-center justify-center gap-6 text-[#6b6558]'>
              <div className='text-[16px]'>
                <span className='text-[#2f2b24] font-semibold'>{chapter?.author?.name || 'yazar tapılmadı'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bookish footer with stats, characters, and date */}
        <div className='absolute inset-x-0 bottom-0'>
          <div className='px-10 py-4 border-t' style={{ borderColor: '#d8d3c4', backgroundColor: '#f3efe6' }}>
            <div className='flex items-center justify-between gap-6 text-[#4a463f]'>
              {/* Left: stats */}
              <div className='flex items-center gap-5 text-[13px] tracking-wide'>
                <span className='flex items-baseline gap-2'>
                  <span className='text-[20px] font-semibold text-[#2f2b24]'>{chapter?._count.reads || 0}</span>
                  <span>oxuma</span>
                </span>
                <span aria-hidden='true' className='text-[#d0cabc]'>
                  •
                </span>
                <span className='flex items-baseline gap-2'>
                  <span className='text-[20px] font-semibold text-[#2f2b24]'>{chapter?._count.favorites || 0}</span>
                  <span>favorit</span>
                </span>
                <span aria-hidden='true' className='text-[#d0cabc]'>
                  •
                </span>
                <span className='flex items-baseline gap-2'>
                  <span className='text-[20px] font-semibold text-[#2f2b24]'>{chapter?._count.comments || 0}</span>
                  <span>şərh</span>
                </span>
              </div>

              {/* Right: characters and date */}
              <div className='flex items-center gap-4'>
                {chapter?.publishedAt && (
                  <div className='text-[15px] text-[#6b6558] whitespace-nowrap'>
                    {format(new Date(chapter.publishedAt), 'd MMMM yyyy, HH:mm')}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      headers: {},
    }
  );
}
