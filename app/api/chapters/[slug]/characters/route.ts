import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { CharacterAppearanceType } from '@prisma/client';

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { slug } = await params;

    // Get request body
    const body = await request.json();
    const { characterId, appearanceType, note, quotesAndThoughts } = body;

    // Validate required fields
    if (!characterId || !appearanceType) {
      return NextResponse.json(
        { success: false, message: 'Character ID and appearance type are required' },
        { status: 400 }
      );
    }

    // Find the chapter and verify ownership
    const chapter = await prisma.chapter.findUnique({
      where: { slug },
      select: { id: true, authorId: true, title: true },
    });

    if (!chapter) {
      return NextResponse.json({ success: false, message: 'Chapter not found' }, { status: 404 });
    }

    if (chapter.authorId !== userId) {
      return NextResponse.json({ success: false, message: 'Only the author can manage characters' }, { status: 403 });
    }

    // Check if character exists
    const character = await prisma.character.findUnique({
      where: { id: characterId },
      select: { id: true, name: true },
    });

    if (!character) {
      return NextResponse.json({ success: false, message: 'Character not found' }, { status: 404 });
    }

    // Check if character is already in chapter
    const existingChapterCharacter = await prisma.chapterCharacter.findUnique({
      where: {
        characterId_chapterId: {
          characterId,
          chapterId: chapter.id,
        },
      },
    });

    if (existingChapterCharacter) {
      return NextResponse.json({ success: false, message: 'Character is already in this chapter' }, { status: 400 });
    }

    // If trying to add POV, check if chapter already has a POV character
    if (appearanceType === 'POV') {
      const existingPOV = await prisma.chapterCharacter.findFirst({
        where: {
          chapterId: chapter.id,
          appearanceType: 'POV',
        },
      });

      if (existingPOV) {
        return NextResponse.json({ success: false, message: 'Chapter already has a POV character' }, { status: 400 });
      }
    }

    // Create the chapter character relationship
    const chapterCharacter = await prisma.chapterCharacter.create({
      data: {
        chapterId: chapter.id,
        characterId,
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
      message: 'Character added to chapter successfully',
      data: chapterCharacter,
    });
  } catch (error) {
    console.error('Error adding character to chapter:', error);
    return NextResponse.json({ success: false, message: 'An unexpected error occurred' }, { status: 500 });
  }
}
