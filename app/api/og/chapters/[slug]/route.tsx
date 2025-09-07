import { getChapter } from '@/lib/fetchers';
import { format } from 'date-fns';
import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  try {
    const chapter = await getChapter(params.slug);

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
            <div style={{ fontSize: 64, color: '#2f2b24' }}>Bölüm tapılmadı</div>
          </div>
        ),
        {
          width: 1200,
          height: 630,
          headers: {
            'Cache-Control': 'public, max-age=31536000, immutable',
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
          {/* Header spacing */}
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
                }}
              >
                {chapter.synopsis || 'bu bölüm haqqında təsvir mövcud deyil.'}
              </div>
            </div>
          </div>

          {/* Footer */}
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
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                    fontSize: '13px',
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
                </div>

                <div>
                  {chapter.publishedAt && (
                    <div style={{ fontSize: '15px', color: '#6b6558' }}>
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
        width: 1200,
        height: 630,
        headers: {
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      }
    );
  } catch (error) {
    console.error('Error generating Chapter OpenGraph image:', error);

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
        width: 1200,
        height: 630,
        headers: {
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      }
    );
  }
}
