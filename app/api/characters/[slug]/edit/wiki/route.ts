import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { respond } from '@/lib/response';
import { CharacterWikiUpdateSchema } from '@/lib/schemas/character.schema';
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const session = await auth();
    const { slug } = await params;

    if (!session?.user?.id) {
      return NextResponse.json(respond.error('Unauthorized'), { status: 401 });
    }

    const body = await request.json();
    const data = CharacterWikiUpdateSchema.parse(body);
    const authorId = (await prisma.chapter.findFirst({ select: { authorId: true } }))?.authorId;

    const existingCharacter = await prisma.character.findUnique({
      where: { slug },
    });

    if (!existingCharacter) {
      return NextResponse.json(respond.error('Character not found'), { status: 404 });
    }

    if (authorId !== session.user.id) {
      return NextResponse.json(respond.error('Only the author can update the wiki of this character'), { status: 403 });
    }

    const character = await prisma.character.update({
      where: { slug },
      data: { wiki: data.wiki },
    });

    revalidatePath(`/characters/${character.slug}`);
    revalidatePath(`/dashboard/characters/${character.slug}`);
    revalidatePath('/dashboard/characters');
    revalidatePath('/');

    return NextResponse.json(respond.success(character, 'Character wiki updated successfully'), { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(respond.error(error), { status: 500 });
  }
}
