import { getCharacter } from '@/lib/fetchers';
import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;

    const character = await getCharacter(slug);

    if (!character) {
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
              background: '#fbfaf7',
              fontFamily: 'Times New Roman, Times, serif',
              padding: '40px',
              textAlign: 'center',
            }}
          >
            <div style={{ display: 'flex', fontSize: 48, color: '#2f2b24', marginBottom: '20px' }}>
              Character Not Found
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
            background: 'radial-gradient(1200px 600px at 50% 40%, #ffffff 0%, #fbfaf7 60%, #f6f3ec 100%)',
            fontFamily: 'Times New Roman, Times, serif',
          }}
        >
          <div style={{ display: 'flex', padding: '40px 48px 0 48px' }} />

          <div
            style={{
              padding: '0 64px 96px 64px',
              flex: 1,
              display: 'flex',
              flexDirection: 'row',
              gap: '40px',
              alignItems: 'center',
              color: '#2f2b24',
            }}
          >
            <div
              style={{
                display: 'flex',
                height: '420px',
                width: '420px',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid #d8d3c4',
                backgroundColor: '#fbfaf7',
              }}
            >
              {character.profileImageUrl ? (
                <div
                  style={{
                    display: 'flex',
                    height: '100%',
                    width: '100%',
                    backgroundImage: `url(${character.profileImageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
              ) : (
                <div
                  style={{
                    display: 'flex',
                    height: '100%',
                    width: '100%',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#6b5e45',
                    background: 'repeating-linear-gradient(45deg, #faf9f6, #faf9f6 10px, #f3f1ea 10px, #f3f1ea 20px)',
                  }}
                >
                  <span
                    style={{
                      fontSize: '160px',
                      lineHeight: 1,
                      fontWeight: 600,
                      textShadow: '0 1px 0 rgba(255,255,255,0.7), 0 3px 10px rgba(0,0,0,0.08)',
                    }}
                  >
                    {((character.name?.[0] || '?') as string).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', paddingRight: '24px', flex: 1 }}>
              <div
                style={{
                  display: 'flex',
                  color: '#6b6558',
                  fontSize: '34px',
                  lineHeight: 1,
                  fontStyle: 'italic',
                }}
              >
                mahmud • personaj
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
                }}
              >
                {character.name || 'personaj tapılmadı'}
              </div>
              {character.description && (
                <div
                  style={{
                    display: 'flex',
                    marginTop: '16px',
                    color: '#4a463f',
                    fontSize: '20px',
                    lineHeight: 1.3,
                    wordWrap: 'break-word',
                  }}
                >
                  {character.description}
                </div>
              )}
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
                      {character._count?.chapters || 0}
                    </span>
                    <span style={{ display: 'flex' }}>iştirak</span>
                  </span>
                  <span style={{ display: 'flex', color: '#d0cabc' }}>•</span>
                  <span style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <span style={{ display: 'flex', fontSize: '20px', fontWeight: 600, color: '#2f2b24' }}>
                      {character._count?.views || 0}
                    </span>
                    <span style={{ display: 'flex' }}>baxış</span>
                  </span>
                  <span style={{ display: 'flex', color: '#d0cabc' }}>•</span>
                  <span style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <span style={{ display: 'flex', fontSize: '20px', fontWeight: 600, color: '#2f2b24' }}>
                      {character._count?.favorites || 0}
                    </span>
                    <span style={{ display: 'flex' }}>favorit</span>
                  </span>
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
            background: '#fbfaf7',
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
