import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createNotification } from '@/lib/fetchers';

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

    // Find the chapter
    const chapter = await prisma.chapter.findUnique({
      where: { slug },
      select: { id: true, authorId: true, title: true },
    });

    if (!chapter) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
    }

    // Check if user has already read this chapter
    const existingRead = await prisma.chapterRead.findUnique({
      where: {
        chapterId_userId: {
          chapterId: chapter.id,
          userId: userId,
        },
      },
    });

    if (existingRead) {
      return NextResponse.json({
        success: true,
        message: 'Chapter already marked as read',
        alreadyRead: true,
      });
    }

    // Mark as read
    await prisma.chapterRead.create({
      data: {
        chapterId: chapter.id,
        userId: userId,
      },
    });

    await createNotification({
      userId: chapter.authorId,
      title: `${user.name} ${chapter.title} bölümünü oxundu`,
      content: 'Yeni bölüm oxundu',
      type: 'NEW_CHAPTER_READ',
      link: `/chapters/${slug}`,
      linkText: 'Bölümə keç',
    });

    return NextResponse.json({
      success: true,
      message: 'Chapter marked as read',
      alreadyRead: false,
    });
  } catch (error) {
    console.error('Error marking chapter as read:', error);
    return NextResponse.json({ error: 'Failed to mark chapter as read' }, { status: 500 });
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ isRead: false });
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
    const existingRead = await prisma.chapterRead.findUnique({
      where: {
        chapterId_userId: {
          chapterId: chapter.id,
          userId: userId,
        },
      },
    });

    return NextResponse.json({
      isRead: !!existingRead,
    });
  } catch (error) {
    console.error('Error checking read status:', error);
    return NextResponse.json({ isRead: false });
  }
}
