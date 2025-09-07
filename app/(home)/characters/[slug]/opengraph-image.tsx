import { getCharacter } from '@/lib/fetchers';
import { ImageResponse } from 'next/og';

export const size = {
  width: 1200,
  height: 630,
} as const;

const SHOW_ALIASES_COUNT = 6;

interface OpengraphImageProps {
  params: Promise<{ slug: string }>;
}

export default async function OpengraphImage({ params }: OpengraphImageProps) {
  const { slug } = await params;
  const character = await getCharacter(slug);

  return new ImageResponse(
    (
      <div
        className='w-full h-full relative flex flex-col'
        style={{
          background: 'radial-gradient(1200px 600px at 50% 40%, #ffffff 0%, #fbfaf7 60%, #f6f3ec 100%)',
          fontFamily: 'Times New Roman, Times, serif',
        }}
      >
        {/* Book header spacing */}
        <div className='px-12 pt-10' />

        {/* Content: two-column with portrait left */}
        <div className='px-16 pb-24 flex-1 grid grid-cols-[420px_1fr] gap-10 items-center text-[#2f2b24]'>
          {/* Left: portrait */}
          <div
            className='h-[420px] w-[420px] rounded-xl overflow-hidden border'
            style={{ borderColor: '#d8d3c4', backgroundColor: '#fbfaf7' }}
          >
            {character?.profileImageUrl ? (
              <div
                className='h-full w-full'
                style={{
                  backgroundImage: `url(${character.profileImageUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
            ) : (
              <div
                className='h-full w-full flex items-center justify-center text-[#6b5e45]'
                style={{
                  background: 'repeating-linear-gradient(45deg, #faf9f6, #faf9f6 10px, #f3f1ea 10px, #f3f1ea 20px)',
                }}
              >
                <span
                  className='text-[160px] leading-none font-semibold'
                  style={{ textShadow: '0 1px 0 rgba(255,255,255,0.7), 0 3px 10px rgba(0,0,0,0.08)' }}
                >
                  {((character?.name?.[0] || '?') as string).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Right: text */}
          <div className='pr-6'>
            <div className='text-[#6b6558] text-[34px] leading-none italic'>mahmud • personaj</div>
            <div className='mt-4 text-[#1f1b15] text-[64px] leading-[1.05] font-semibold tracking-tight line-clamp-3'>
              {character?.name || 'personaj tapılmadı'}
            </div>
            {character?.description && (
              <div className='mt-4 text-[#4a463f] text-[20px] leading-snug line-clamp-4'>{character.description}</div>
            )}
            {character?.aliases && character?.aliases.length > 0 && (
              <div className='mt-6 flex items-center gap-2 flex-wrap max-w-[700px]'>
                {character.aliases.slice(0, SHOW_ALIASES_COUNT).map((alias) => (
                  <span
                    key={alias}
                    className='px-2.5 py-[2px] rounded-full border text-[#2f2b24] text-[12px]'
                    style={{ borderColor: '#d8d3c4', backgroundColor: '#fbfaf7' }}
                  >
                    {alias}
                  </span>
                ))}
                {character.aliases.length > SHOW_ALIASES_COUNT && (
                  <span
                    className='px-2.5 py-[2px] rounded-full border text-[#2f2b24] text-[12px]'
                    style={{ borderColor: '#d8d3c4', backgroundColor: '#fbfaf7' }}
                  >
                    +{character.aliases.length - SHOW_ALIASES_COUNT}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bookish footer with stats and birth info */}
        <div className='absolute inset-x-0 bottom-0'>
          <div className='px-10 py-4 border-t' style={{ borderColor: '#d8d3c4', backgroundColor: '#fbfaf7' }}>
            <div className='flex items-center justify-between gap-6 text-[#4a463f]'>
              {/* Left: stats */}
              <div className='flex items-center gap-5 text-[13px] tracking-wide'>
                <span className='flex items-baseline gap-2'>
                  <span className='text-[20px] font-semibold text-[#2f2b24]'>
                    {character?._count?.chapters || character?.chapters?.length || 0}
                  </span>
                  <span>iştirak</span>
                </span>
                <span aria-hidden='true' className='text-[#d0cabc]'>
                  •
                </span>
                <span className='flex items-baseline gap-2'>
                  <span className='text-[20px] font-semibold text-[#2f2b24]'>{character?._count?.views || 0}</span>
                  <span>baxış</span>
                </span>
                <span aria-hidden='true' className='text-[#d0cabc]'>
                  •
                </span>
                <span className='flex items-baseline gap-2'>
                  <span className='text-[20px] font-semibold text-[#2f2b24]'>{character?._count?.favorites || 0}</span>
                  <span>favorit</span>
                </span>
              </div>
              {/* Right: birth info */}
              <div className='flex items-center gap-3 text-[13px] text-[#6b6558]'>
                {character?.dateOfBirth && <span className='text-[#2f2b24]'>{character?.dateOfBirth || ''}</span>}
                {character?.placeOfBirth && (
                  <>
                    <span aria-hidden='true' className='text-[#d0cabc]'>
                      •
                    </span>
                    <span className='text-[#2f2b24]'>{character?.placeOfBirth}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
