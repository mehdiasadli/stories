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
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '64px',
            background: 'linear-gradient(135deg, #fefbf0 0%, #f8f2e4 25%, #f2ebd8 50%, #ece4cc 75%, #e6ddc0 100%)',
            border: '12px solid #8b4513',
            borderRadius: '8px',
            position: 'relative',
            fontFamily: "Georgia, 'Times New Roman', serif",
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                'radial-gradient(circle at 20% 30%, rgba(139, 69, 19, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(160, 82, 45, 0.03) 0%, transparent 50%)',
              borderRadius: 'inherit',
              pointerEvents: 'none',
            }}
          />

          {/* Header Section */}
          <div style={{ display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
            <div
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div
                  style={{
                    width: '16px',
                    height: '16px',
                    background: '#8b4513',
                    borderRadius: '50%',
                    marginRight: '16px',
                  }}
                />
                <span
                  style={{
                    fontSize: '32px',
                    fontFamily: "Georgia, 'Times New Roman', serif",
                    color: '#654321',
                    letterSpacing: '3px',
                    fontWeight: 'bold',
                  }}
                >
                  mahmud
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span
                  style={{
                    fontSize: '28px',
                    color: '#3d2914',
                    fontWeight: '600',
                    fontFamily: "Georgia, 'Times New Roman', serif",
                    background: 'rgba(254, 247, 205, 0.8)',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    border: '2px solid #8b4513',
                  }}
                >
                  bölüm # {chapter.order}
                </span>
              </div>
            </div>

            {/* Main Title */}
            <h1
              style={{
                fontSize: '72px',
                fontFamily: "Georgia, 'Times New Roman', serif",
                color: '#654321',
                lineHeight: '1.1',
                marginBottom: '24px',
                fontWeight: 'bold',
                letterSpacing: '-1px',
              }}
            >
              {chapter.title}
            </h1>

            {/* Description */}
            <p
              style={{
                fontSize: '28px',
                color: '#8b4513',
                lineHeight: '1.5',
                maxWidth: '900px',
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontStyle: 'italic',
              }}
            >
              {chapter.synopsis}
            </p>
          </div>

          {/* Footer Section */}
          <div
            style={{
              display: 'flex',
              alignItems: 'end',
              justifyContent: 'space-between',
              position: 'relative',
              zIndex: 1,
            }}
          >
            {/* Author */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span
                style={{
                  fontSize: '28px',
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  color: '#654321',
                  fontWeight: 'bold',
                }}
              >
                {chapter.author.name}
              </span>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '48px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span
                  style={{
                    fontSize: '36px',
                    fontWeight: 'bold',
                    color: '#654321',
                    fontFamily: "Georgia, 'Times New Roman', serif",
                  }}
                >
                  {chapter._count.reads.toLocaleString()}
                </span>
                <span
                  style={{
                    fontSize: '20px',
                    color: '#a0522d',
                    fontFamily: "Georgia, 'Times New Roman', serif",
                    fontStyle: 'italic',
                  }}
                >
                  oxuma
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span
                  style={{
                    fontSize: '36px',
                    fontWeight: 'bold',
                    color: '#654321',
                    fontFamily: "Georgia, 'Times New Roman', serif",
                  }}
                >
                  {chapter._count.favorites.toLocaleString()}
                </span>
                <span
                  style={{
                    fontSize: '20px',
                    color: '#a0522d',
                    fontFamily: "Georgia, 'Times New Roman', serif",
                    fontStyle: 'italic',
                  }}
                >
                  favorit
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span
                  style={{
                    fontSize: '36px',
                    fontWeight: 'bold',
                    color: '#654321',
                    fontFamily: "Georgia, 'Times New Roman', serif",
                  }}
                >
                  {chapter._count.comments.toLocaleString()}
                </span>
                <span
                  style={{
                    fontSize: '20px',
                    color: '#a0522d',
                    fontFamily: "Georgia, 'Times New Roman', serif",
                    fontStyle: 'italic',
                  }}
                >
                  şərh
                </span>
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
