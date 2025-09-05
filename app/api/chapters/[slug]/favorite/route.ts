import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await params;
    const userId = session.user.id;

    // Find the chapter
    const chapter = await prisma.chapter.findUnique({
      where: { slug, status: 'PUBLISHED' },
      select: { id: true },
    });

    if (!chapter) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
    }

    // Check if user has read this chapter first
    const hasRead = await prisma.chapterRead.findUnique({
      where: {
        chapterId_userId: {
          chapterId: chapter.id,
          userId: userId,
        },
      },
    });

    if (!hasRead) {
      return NextResponse.json(
        {
          error: 'You must read the chapter before favoriting it',
          mustReadFirst: true,
        },
        { status: 400 }
      );
    }

    // Check if user has already favorited this chapter
    const existingFavorite = await prisma.favoriteChapter.findUnique({
      where: {
        chapterId_userId: {
          chapterId: chapter.id,
          userId: userId,
        },
      },
    });

    if (existingFavorite) {
      return NextResponse.json({
        success: true,
        message: 'Chapter already favorited',
        alreadyFavorited: true,
      });
    }

    // Add to favorites
    await prisma.favoriteChapter.create({
      data: {
        chapterId: chapter.id,
        userId: userId,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Chapter added to favorites',
      alreadyFavorited: false,
    });
  } catch (error) {
    console.error('Error favoriting chapter:', error);
    return NextResponse.json({ error: 'Failed to favorite chapter' }, { status: 500 });
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ isFavorited: false, hasRead: false });
    }

    const { slug } = await params;
    const userId = session.user.id;

    // Find the chapter
    const chapter = await prisma.chapter.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!chapter) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
    }

    // Check if user has read this chapter
    const hasRead = await prisma.chapterRead.findUnique({
      where: {
        chapterId_userId: {
          chapterId: chapter.id,
          userId: userId,
        },
      },
    });

    // Check if user has favorited this chapter
    const isFavorited = await prisma.favoriteChapter.findUnique({
      where: {
        chapterId_userId: {
          chapterId: chapter.id,
          userId: userId,
        },
      },
    });

    return NextResponse.json({
      isFavorited: !!isFavorited,
      hasRead: !!hasRead,
    });
  } catch (error) {
    console.error('Error checking favorite status:', error);
    return NextResponse.json({ isFavorited: false, hasRead: false });
  }
}
