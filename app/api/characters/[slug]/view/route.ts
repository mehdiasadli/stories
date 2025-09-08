import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateFingerprint } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    const { slug } = await params;

    // Basic bot detection: skip known bots/crawlers
    const userAgent = request.headers.get('user-agent') || '';
    const secPurpose = request.headers.get('sec-purpose') || '';
    const purpose = request.headers.get('purpose') || '';
    const isPrefetch = secPurpose.includes('prefetch') || purpose === 'prefetch';

    const botRegex =
      /(bot|crawler|spider|crawling|facebookexternalhit|slackbot|twitterbot|bingbot|googlebot|duckduckbot|baiduspider|yandex|ahrefs|semrush|MJ12bot|dotbot|petalbot)/i;
    if (isPrefetch || botRegex.test(userAgent)) {
      return NextResponse.json({ success: true, skipped: 'bot_or_prefetch' });
    }

    const character = await prisma.character.findUnique({
      where: { slug, published: true },
      select: { id: true },
    });

    if (!character) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 });
    }

    // If authenticated user: dedupe by user within 1 hour
    if (userId) {
      const lastView = await prisma.characterView.findFirst({
        where: {
          userId,
          character: { published: true },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (lastView && lastView.createdAt > new Date(Date.now() - 1 * 60 * 60 * 1000)) {
        // do nothing and return 200
        return NextResponse.json({ success: true, message: 'Character already viewed in the last hour' });
      }
    }

    // For anonymous users: try to dedupe if fingerprint exists
    // Fingerprint is optional; if not present, we count the view
    const fingerprintHeader = request.headers.get('x-fingerprint') || generateFingerprint(request);
    if (!userId && fingerprintHeader) {
      const lastAnonView = await prisma.characterView.findFirst({
        where: {
          characterId: character.id,
          fingerprint: fingerprintHeader,
        },
        orderBy: { createdAt: 'desc' },
      });

      if (lastAnonView && lastAnonView.createdAt > new Date(Date.now() - 1 * 60 * 60 * 1000)) {
        return NextResponse.json({ success: true, message: 'Anonymous character view throttled by fingerprint' });
      }
    }

    await prisma.characterView.create({
      data: {
        characterId: character.id,
        userId: userId || null,
        fingerprint: !userId ? request.headers.get('x-fingerprint') || null : null,
      },
    });

    return NextResponse.json({ success: true, message: 'Character viewed successfully' });
  } catch (error) {
    console.error('Error viewing character:', error);
    return NextResponse.json({ error: 'Failed to view character' }, { status: 500 });
  }
}
