import { getCharacter } from '@/lib/fetchers';
import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  try {
    console.log('🔍 OG Debug - Character slug:', params.slug);

    const character = await getCharacter(params.slug);

    console.log('👤 Character data:', {
      found: !!character,
      name: character?.name,
      description: character?.description,
      profileImageUrl: character?.profileImageUrl,
      published: character?.published,
      aliases: character?.aliases,
      counts: character?._count,
    });

    if (!character) {
      console.log('❌ No character found, showing fallback');
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
            <div style={{ fontSize: 48, color: '#2f2b24', marginBottom: '20px' }}>Character Not Found</div>
            <div style={{ fontSize: 24, color: '#6b6558' }}>Slug: {params.slug}</div>
          </div>
        ),
        {
          width: 1200,
          height: 630,
        }
      );
    }

    console.log('✅ Character found, rendering full image');

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
          {/* Header spacing */}
          <div style={{ padding: '40px 48px 0 48px' }} />

          {/* Content: two-column */}
          <div
            style={{
              padding: '0 64px 96px 64px',
              flex: 1,
              display: 'grid',
              gridTemplateColumns: '420px 1fr',
              gap: '40px',
              alignItems: 'center',
              color: '#2f2b24',
            }}
          >
            {/* Left: portrait */}
            <div
              style={{
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
                    height: '100%',
                    width: '100%',
                    display: 'flex',
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

            {/* Right: text */}
            <div style={{ paddingRight: '24px' }}>
              <div
                style={{
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
    console.error('❌ Error in character OG generation:', error);

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
          <div style={{ fontSize: 48, color: '#2f2b24', marginBottom: '20px' }}>Error Generating Image</div>
          <div style={{ fontSize: 24, color: '#6b6558' }}>
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
