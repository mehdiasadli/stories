import { getChapter } from '@/lib/fetchers';
import { format } from 'date-fns';
import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const alt = 'Chapter OpenGraph Image';
export const size = {
  width: 1200,
  height: 630,
} as const;
export const contentType = 'image/png';

interface OpengraphImageProps {
  params: Promise<{ slug: string }>;
}

export default async function OpengraphImage({ params }: OpengraphImageProps) {
  try {
    const { slug } = await params;
    const chapter = await getChapter(slug);

    if (!chapter) {
      return new ImageResponse(
        (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'radial-gradient(1200px 600px at 50% 40%, #f7f3e9 0%, #f1ecdf 60%, #ebe5d7 100%)',
              fontFamily: 'Times New Roman, Times, serif',
            }}
          >
            <div style={{ fontSize: 64, color: '#2f2b24' }}>bölüm tapılmadı</div>
          </div>
        ),
        {
          ...size,
          headers: {
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
          },
        }
      );
    }

    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            background: 'radial-gradient(1200px 600px at 50% 40%, #f7f3e9 0%, #f1ecdf 60%, #ebe5d7 100%)',
            fontFamily: 'Times New Roman, Times, serif',
          }}
        >
          {/* Book header spacing */}
          <div style={{ padding: '40px 48px 0 48px' }} />

          {/* Content */}
          <div
            style={{
              padding: '0 64px 96px 64px',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              color: '#2f2b24',
            }}
          >
            <div style={{ width: '100%', maxWidth: '900px', textAlign: 'center' }}>
              <div
                style={{
                  color: '#6b6558',
                  fontSize: '34px',
                  lineHeight: 1,
                  fontStyle: 'italic',
                }}
              >
                mahmud • bölüm #{chapter.order}
              </div>
              <div
                style={{
                  marginTop: '16px',
                  color: '#1f1b15',
                  fontSize: '64px',
                  lineHeight: 1.05,
                  fontWeight: 600,
                  letterSpacing: '-0.02em',
                  // Handle long titles
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {chapter.title}
              </div>
              <div
                style={{
                  marginTop: '24px',
                  color: '#4a463f',
                  fontSize: '22px',
                  lineHeight: 1.3,
                  // Handle long synopsis
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {chapter.synopsis || 'bu bölüm haqqında təsvir mövcud deyil.'}
              </div>
              <div
                style={{
                  marginTop: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '24px',
                  color: '#6b6558',
                }}
              >
                <div style={{ fontSize: '16px' }}>
                  <span style={{ color: '#2f2b24', fontWeight: 600 }}>{chapter.author?.name || 'yazar tapılmadı'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bookish footer with stats, characters, and date */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
            }}
          >
            <div
              style={{
                padding: '16px 40px',
                borderTop: '1px solid #d8d3c4',
                backgroundColor: '#f3efe6',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '24px',
                  color: '#4a463f',
                }}
              >
                {/* Left: stats */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                    fontSize: '13px',
                    letterSpacing: '0.02em',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <span style={{ fontSize: '20px', fontWeight: 600, color: '#2f2b24' }}>
                      {chapter._count?.reads || 0}
                    </span>
                    <span>oxuma</span>
                  </span>
                  <span style={{ color: '#d0cabc' }}>•</span>
                  <span style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <span style={{ fontSize: '20px', fontWeight: 600, color: '#2f2b24' }}>
                      {chapter._count?.favorites || 0}
                    </span>
                    <span>favorit</span>
                  </span>
                  <span style={{ color: '#d0cabc' }}>•</span>
                  <span style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <span style={{ fontSize: '20px', fontWeight: 600, color: '#2f2b24' }}>
                      {chapter._count?.comments || 0}
                    </span>
                    <span>şərh</span>
                  </span>
                </div>

                {/* Right: date */}
                <div>
                  {chapter.publishedAt && (
                    <div
                      style={{
                        fontSize: '15px',
                        color: '#6b6558',
                        whiteSpace: 'nowrap',
                      }}
                    >
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
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    );
  } catch (error) {
    console.error('Error generating OpenGraph image:', error);

    // Return a fallback image on error
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f7f3e9',
            fontFamily: 'Times New Roman, Times, serif',
          }}
        >
          <div style={{ fontSize: 48, color: '#2f2b24' }}>mahmud</div>
        </div>
      ),
      {
        ...size,
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    );
  }
}
