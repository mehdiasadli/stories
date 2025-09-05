import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { CharacterAppearanceType } from '@prisma/client';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; chapterCharacterId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { slug, chapterCharacterId } = await params;

    // Get request body
    const body = await request.json();
    const { appearanceType, note, quotesAndThoughts } = body;

    // Validate required fields
    if (!appearanceType) {
      return NextResponse.json({ success: false, message: 'Appearance type is required' }, { status: 400 });
    }

    // Find the chapter and verify ownership
    const chapter = await prisma.chapter.findUnique({
      where: { slug },
      select: { id: true, authorId: true },
    });

    if (!chapter) {
      return NextResponse.json({ success: false, message: 'Chapter not found' }, { status: 404 });
    }

    if (chapter.authorId !== userId) {
      return NextResponse.json({ success: false, message: 'Only the author can manage characters' }, { status: 403 });
    }

    // Find the chapter character
    const chapterCharacter = await prisma.chapterCharacter.findUnique({
      where: { id: chapterCharacterId },
      select: { id: true, chapterId: true, appearanceType: true },
    });

    if (!chapterCharacter) {
      return NextResponse.json({ success: false, message: 'Chapter character not found' }, { status: 404 });
    }

    if (chapterCharacter.chapterId !== chapter.id) {
      return NextResponse.json(
        { success: false, message: 'Chapter character does not belong to this chapter' },
        { status: 400 }
      );
    }

    // If trying to change to POV, check if chapter already has a POV character
    if (appearanceType === 'POV' && chapterCharacter.appearanceType !== 'POV') {
      const existingPOV = await prisma.chapterCharacter.findFirst({
        where: {
          chapterId: chapter.id,
          appearanceType: 'POV',
          id: { not: chapterCharacterId },
        },
      });

      if (existingPOV) {
        return NextResponse.json({ success: false, message: 'Chapter already has a POV character' }, { status: 400 });
      }
    }

    // Update the chapter character
    const updatedChapterCharacter = await prisma.chapterCharacter.update({
      where: { id: chapterCharacterId },
      data: {
        appearanceType: appearanceType as CharacterAppearanceType,
        note: note || null,
        quotesAndThoughts: quotesAndThoughts || [],
      },
      include: {
        character: {
          select: {
            id: true,
            name: true,
            slug: true,
            gender: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Character updated successfully',
      data: updatedChapterCharacter,
    });
  } catch (error) {
    console.error('Error updating chapter character:', error);
    return NextResponse.json({ success: false, message: 'An unexpected error occurred' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; chapterCharacterId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { slug, chapterCharacterId } = await params;

    // Find the chapter and verify ownership
    const chapter = await prisma.chapter.findUnique({
      where: { slug },
      select: { id: true, authorId: true },
    });

    if (!chapter) {
      return NextResponse.json({ success: false, message: 'Chapter not found' }, { status: 404 });
    }

    if (chapter.authorId !== userId) {
      return NextResponse.json({ success: false, message: 'Only the author can manage characters' }, { status: 403 });
    }

    // Find the chapter character
    const chapterCharacter = await prisma.chapterCharacter.findUnique({
      where: { id: chapterCharacterId },
      select: { id: true, chapterId: true },
    });

    if (!chapterCharacter) {
      return NextResponse.json({ success: false, message: 'Chapter character not found' }, { status: 404 });
    }

    if (chapterCharacter.chapterId !== chapter.id) {
      return NextResponse.json(
        { success: false, message: 'Chapter character does not belong to this chapter' },
        { status: 400 }
      );
    }

    // Delete the chapter character
    await prisma.chapterCharacter.delete({
      where: { id: chapterCharacterId },
    });

    return NextResponse.json({
      success: true,
      message: 'Character removed from chapter successfully',
    });
  } catch (error) {
    console.error('Error deleting chapter character:', error);
    return NextResponse.json({ success: false, message: 'An unexpected error occurred' }, { status: 500 });
  }
}
