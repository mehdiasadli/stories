import { auth } from '@/lib/auth';
import { createNotification, getAuthorId } from '@/lib/fetchers';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await params;
    const userId = session.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const character = await prisma.character.findUnique({
      where: { slug, published: true },
      select: { id: true, name: true },
    });

    const authorId = await getAuthorId();

    if (!authorId) {
      return NextResponse.json({ error: 'Author not found' }, { status: 404 });
    }

    if (!character) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 });
    }

    const existingFavorite = await prisma.favoriteCharacter.findUnique({
      where: {
        characterId_userId: {
          characterId: character.id,
          userId: userId,
        },
      },
    });

    if (existingFavorite) {
      return NextResponse.json({ success: true, message: 'Character already favorited', alreadyFavorited: true });
    }

    await prisma.favoriteCharacter.create({
      data: { characterId: character.id, userId },
    });

    await createNotification({
      userId: authorId,
      title: `${user.name} ${character.name} personajını favoritlərə əlavə etdi`,
      content: 'Yeni personaj favoritlərə əlavə edildi',
      type: 'NEW_CHARACTER_FAVORITE',
      link: `/characters/${slug}`,
      linkText: 'Personaja keç',
    });

    return NextResponse.json({ success: true, message: 'Character favorited successfully' });
  } catch (error) {
    console.error('Error favoriting character:', error);
    return NextResponse.json({ error: 'Failed to favorite character' }, { status: 500 });
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ isFavorited: false });
    }

    const { slug } = await params;
    const userId = session.user.id;

    const character = await prisma.character.findUnique({
      where: { slug, published: true },
      select: { id: true },
    });

    if (!character) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 });
    }

    // check if user has favorited this character
    const existingFavorite = await prisma.favoriteCharacter.findUnique({
      where: {
        characterId_userId: {
          characterId: character.id,
          userId: userId,
        },
      },
    });

    return NextResponse.json({ isFavorited: !!existingFavorite });
  } catch (error) {
    console.error('Error checking favorite status:', error);
    return NextResponse.json({ isFavorited: false });
  }
}
