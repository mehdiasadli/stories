import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { CharacterCreateSchema } from '@/lib/schemas/character.schema';
import { slugify } from '@/lib/utils';
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { respond } from '@/lib/response';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(respond.error('Unauthorized'), { status: 401 });
    }

    const body = await request.json();
    const data = CharacterCreateSchema.parse(body);
    const slug = slugify(data.name);

    const existingCharacter = await prisma.character.findUnique({
      where: { slug },
    });

    if (existingCharacter) {
      return NextResponse.json(respond.error('Character with this name already exists'), { status: 400 });
    }

    const character = await prisma.character.create({
      data: {
        ...data,
        slug,
        titles: data.titles || [],
        aliases: data.aliases || [],
      },
    });

    revalidatePath(`/characters`);
    revalidatePath(`/characters/${character.slug}`);
    revalidatePath(`/dashboard/characters/${character.slug}`);
    revalidatePath(`/dashboard/characters`);
    revalidatePath('/');

    return NextResponse.json(respond.success(character, 'Character created successfully'));
  } catch (e) {
    console.error('Error creating character:', e);
    return NextResponse.json(respond.error('Failed to create character'), { status: 500 });
  }
}
