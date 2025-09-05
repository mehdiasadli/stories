import { NextRequest, NextResponse } from 'next/server';
import { auth } from './lib/auth';

export default auth(async (req: NextRequest) => {
  const session = await auth();

  if (session?.user && req.nextUrl.pathname.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/', req.nextUrl));
  }

  // Record views for character pages on every real navigation request
  try {
    const isGet = req.method === 'GET';
    const pathname = req.nextUrl.pathname;
    const characterMatch = pathname.match(/^\/characters\/([^\/]+)$/);

    // Skip prefetch and non-document requests
    const isPrefetch =
      req.headers.get('purpose') === 'prefetch' ||
      req.headers.get('x-middleware-prefetch') === '1' ||
      req.headers.get('next-router-prefetch') === '1' ||
      req.headers.get('sec-purpose') === 'prefetch';
    const isDocument = req.headers.get('sec-fetch-dest') === 'document';

    // Basic bot detection
    const userAgent = req.headers.get('user-agent') || '';
    const botRegex =
      /(bot|crawler|spider|crawling|facebookexternalhit|slackbot|twitterbot|bingbot|googlebot|duckduckbot|baiduspider|yandex|ahrefs|semrush|MJ12bot|dotbot|petalbot)/i;
    const isBot = botRegex.test(userAgent);

    if (isGet && characterMatch && !isPrefetch && isDocument && !isBot) {
      const slug = characterMatch[1];

      // Call the existing API to record a view. Use a relative URL to forward cookies automatically.
      await fetch(new URL(`/api/characters/${slug}/view`, req.url), {
        method: 'POST',
        headers: {
          cookie: req.headers.get('cookie') ?? '',
          'user-agent': userAgent,
          'x-forwarded-for': req.headers.get('x-forwarded-for') ?? '',
        },
        cache: 'no-store',
      });
    }
  } catch (err) {
    // Silently ignore errors to avoid interrupting the user request
    console.error('middleware view log error', err);
  }

  return null;
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
