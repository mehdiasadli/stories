import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    const { slug } = await params;

    const character = await prisma.character.findUnique({
      where: { slug, published: true },
      select: { id: true },
    });

    if (!character) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 });
    }

    // if there is user, check if his last view is less than 1 hour ago
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

    await prisma.characterView.create({
      data: {
        characterId: character.id,
        userId: userId || null,
      },
    });
  } catch (error) {
    console.error('Error viewing character:', error);
    return NextResponse.json({ error: 'Failed to view character' }, { status: 500 });
  }
}
