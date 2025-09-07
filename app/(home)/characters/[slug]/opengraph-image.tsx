// /(home)/characters/[slug]/opengraph-image.tsx
import { getCharacter } from '@/lib/fetchers';
import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const alt = 'Chapter OpenGraph Image';
export const size = {
  width: 1200,
  height: 630,
} as const;
export const contentType = 'image/png';

const SHOW_ALIASES_COUNT = 6;

interface OpengraphImageProps {
  params: Promise<{ slug: string }>;
}

export default async function OpengraphImage({ params }: OpengraphImageProps) {
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
              alignItems: 'center',
              justifyContent: 'center',
              background: 'radial-gradient(1200px 600px at 50% 40%, #ffffff 0%, #fbfaf7 60%, #f6f3ec 100%)',
              fontFamily: 'Times New Roman, Times, serif',
            }}
          >
            <div style={{ fontSize: 64, color: '#2f2b24' }}>Personaj tapılmadı</div>
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
            background: 'radial-gradient(1200px 600px at 50% 40%, #ffffff 0%, #fbfaf7 60%, #f6f3ec 100%)',
            fontFamily: 'Times New Roman, Times, serif',
          }}
        >
          {/* Book header spacing */}
          <div style={{ padding: '40px 48px 0 48px' }} />

          {/* Content: two-column with portrait left */}
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
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
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
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 4,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {character.description}
                </div>
              )}
              {character.aliases && character.aliases.length > 0 && (
                <div
                  style={{
                    marginTop: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    flexWrap: 'wrap',
                    maxWidth: '700px',
                  }}
                >
                  {character.aliases.slice(0, SHOW_ALIASES_COUNT).map((alias, index) => (
                    <span
                      key={`${alias}-${index}`}
                      style={{
                        padding: '2px 10px',
                        borderRadius: '20px',
                        border: '1px solid #d8d3c4',
                        backgroundColor: '#fbfaf7',
                        color: '#2f2b24',
                        fontSize: '12px',
                      }}
                    >
                      {alias}
                    </span>
                  ))}
                  {character.aliases.length > SHOW_ALIASES_COUNT && (
                    <span
                      style={{
                        padding: '2px 10px',
                        borderRadius: '20px',
                        border: '1px solid #d8d3c4',
                        backgroundColor: '#fbfaf7',
                        color: '#2f2b24',
                        fontSize: '12px',
                      }}
                    >
                      +{character.aliases.length - SHOW_ALIASES_COUNT}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Bookish footer with stats and birth info */}
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
                backgroundColor: '#fbfaf7',
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
                      {character._count?.chapters || character.chapters?.length || 0}
                    </span>
                    <span>iştirak</span>
                  </span>
                  <span style={{ color: '#d0cabc' }}>•</span>
                  <span style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <span style={{ fontSize: '20px', fontWeight: 600, color: '#2f2b24' }}>
                      {character._count?.views || 0}
                    </span>
                    <span>baxış</span>
                  </span>
                  <span style={{ color: '#d0cabc' }}>•</span>
                  <span style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <span style={{ fontSize: '20px', fontWeight: 600, color: '#2f2b24' }}>
                      {character._count?.favorites || 0}
                    </span>
                    <span>favorit</span>
                  </span>
                </div>

                {/* Right: birth info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: '#6b6558' }}>
                  {character.dateOfBirth && <span style={{ color: '#2f2b24' }}>{character.dateOfBirth}</span>}
                  {character.placeOfBirth && (
                    <>
                      <span style={{ color: '#d0cabc' }}>•</span>
                      <span style={{ color: '#2f2b24' }}>{character.placeOfBirth}</span>
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
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    );
  } catch (error) {
    console.error('Error generating Character OpenGraph image:', error);

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
            background: '#fbfaf7',
            fontFamily: 'Times New Roman, Times, serif',
          }}
        >
          <div style={{ fontSize: 48, color: '#2f2b24' }}>mahmud • personaj</div>
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
