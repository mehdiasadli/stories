import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { respond } from '@/lib/response';
import { CharacterUpdateSchema } from '@/lib/schemas/character.schema';
import { slugify } from '@/lib/utils';
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
    const data = CharacterUpdateSchema.parse(body);

    const existingCharacter = await prisma.character.findUnique({
      where: { slug },
    });

    if (!existingCharacter) {
      return NextResponse.json(respond.error('Character not found'), { status: 404 });
    }

    // check if name updated, update the slug as well
    let newSlug = slug;
    if (data.name && data.name !== existingCharacter.name) {
      newSlug = slugify(data.name);
    }

    const character = await prisma.character.update({
      where: { slug },
      data: {
        ...data,
        slug: newSlug,
        titles: data.titles || [],
        aliases: data.aliases || [],
      },
    });

    revalidatePath('/characters');
    revalidatePath(`/characters/${character.slug}`);
    revalidatePath('/dashboard/characters');
    revalidatePath(`/dashboard/characters/${character.slug}`);
    revalidatePath('/');

    if (newSlug !== slug) {
      revalidatePath(`/characters/${slug}`);
      revalidatePath(`/dashboard/characters/${slug}`);
    }

    return NextResponse.json(respond.success(character, 'Character updated successfully'), { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(respond.error(e), { status: 500 });
  }
}
