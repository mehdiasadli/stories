import { getChapter } from '@/lib/fetchers';
import { format } from 'date-fns';
import { az } from 'date-fns/locale';
import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
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
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#f7f3e9',
              fontFamily: 'Times New Roman, Times, serif',
              padding: '40px',
              textAlign: 'center',
            }}
          >
            <div style={{ display: 'flex', fontSize: 48, color: '#2f2b24', marginBottom: '20px' }}>
              Chapter Not Found
            </div>
            <div style={{ display: 'flex', fontSize: 24, color: '#6b6558' }}>Slug: {slug}</div>
          </div>
        ),
        {
          width: 1200,
          height: 630,
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
          }}
        >
          <div style={{ display: 'flex', padding: '40px 48px 0 48px' }}></div>

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
            <div
              style={{
                width: '100%',
                maxWidth: '900px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  color: '#6b6558',
                  fontSize: '34px',
                  lineHeight: 1,
                  fontStyle: 'italic',
                }}
              >
                mahmud • bölüm #{chapter.order || '?'}
              </div>

              <div
                style={{
                  display: 'flex',
                  marginTop: '16px',
                  color: '#1f1b15',
                  fontSize: '64px',
                  lineHeight: 1.05,
                  fontWeight: 600,
                  letterSpacing: '-0.02em',
                  wordWrap: 'break-word',
                  maxWidth: '100%',
                }}
              >
                {chapter.title || 'Başlıq yoxdur'}
              </div>

              <div
                style={{
                  display: 'flex',
                  marginTop: '24px',
                  color: '#4a463f',
                  fontSize: '22px',
                  lineHeight: 1.3,
                  wordWrap: 'break-word',
                  maxWidth: '100%',
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
                <div style={{ display: 'flex', fontSize: '16px' }}>
                  <span style={{ color: '#2f2b24', fontWeight: 600 }}>{chapter.author?.name || 'yazar tapılmadı'}</span>
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
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
                    <span style={{ display: 'flex', fontSize: '20px', fontWeight: 600, color: '#2f2b24' }}>
                      {chapter._count?.reads || 0}
                    </span>
                    <span style={{ display: 'flex' }}>oxuma</span>
                  </span>
                  <span style={{ display: 'flex', color: '#d0cabc' }}>•</span>
                  <span style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <span style={{ display: 'flex', fontSize: '20px', fontWeight: 600, color: '#2f2b24' }}>
                      {chapter._count?.favorites || 0}
                    </span>
                    <span style={{ display: 'flex' }}>favorit</span>
                  </span>
                  <span style={{ display: 'flex', color: '#d0cabc' }}>•</span>
                  <span style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <span style={{ display: 'flex', fontSize: '20px', fontWeight: 600, color: '#2f2b24' }}>
                      {chapter._count?.comments || 0}
                    </span>
                    <span style={{ display: 'flex' }}>şərh</span>
                  </span>
                </div>

                <div style={{ display: 'flex' }}>
                  {chapter.publishedAt && (
                    <div style={{ display: 'flex', fontSize: '15px', color: '#6b6558', whiteSpace: 'nowrap' }}>
                      {format(new Date(chapter.publishedAt), 'd MMMM yyyy, HH:mm', { locale: az })}
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
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f7f3e9',
            fontFamily: 'Times New Roman, Times, serif',
            padding: '40px',
            textAlign: 'center',
          }}
        >
          <div style={{ display: 'flex', fontSize: 48, color: '#2f2b24', marginBottom: '20px' }}>
            Error Generating Image
          </div>
          <div style={{ display: 'flex', fontSize: 24, color: '#6b6558' }}>
            {error instanceof Error ? error.message : 'Unknown error'}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  }
}
