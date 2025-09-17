import { auth } from '@/lib/auth';
import { createNotification, getAuthorId } from '@/lib/fetchers';
import { prisma } from '@/lib/prisma';
import { generateFingerprint } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, id: true },
    });

    const authorId = await getAuthorId();

    if (!authorId) {
      return NextResponse.json({ error: 'Author not found' }, { status: 404 });
    }

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
      select: { id: true, name: true },
    });

    if (!character) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 });
    }

    const fingerprint = generateFingerprint(request);

    await prisma.characterView.create({
      data: {
        characterId: character.id,
        userId: userId || null,
        fingerprint: !userId ? fingerprint : null,
      },
    });

    if (user && user.id !== authorId) {
      await createNotification({
        userId: authorId,
        title: `${user.name} ${character.name} personajına baxdı`,
        content: 'Yeni personaja baxıldı',
        type: 'NEW_CHARACTER_VIEW',
        link: `/characters/${slug}`,
        linkText: 'Personaja keç',
      });
    }

    return NextResponse.json({ success: true, message: 'Character viewed successfully' });
  } catch (error) {
    console.error('Error viewing character:', error);
    return NextResponse.json({ error: 'Failed to view character' }, { status: 500 });
  }
}
