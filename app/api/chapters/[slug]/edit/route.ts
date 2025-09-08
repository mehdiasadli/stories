import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ChapterUpdateSchema } from '@/lib/schemas/chapter.schema';
import { slugify } from '@/lib/utils';
import { revalidatePath } from 'next/cache';
import { sendNewChapterNotification } from '@/lib/mail';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await params;
    const body = await request.json();

    // Parse and validate the data
    const data = ChapterUpdateSchema.parse({
      slug,
      ...body,
    });

    const authorId = session.user.id;

    // Check if chapter exists and user is authorized
    const existingChapter = await prisma.chapter.findUnique({
      where: { slug },
    });

    if (!existingChapter) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
    }

    if (existingChapter.authorId !== authorId) {
      return NextResponse.json({ error: 'Only the author can update this chapter' }, { status: 403 });
    }

    // Check if order is unique (if changed)
    if (data.order && data.order !== existingChapter.order) {
      const existingOrder = await prisma.chapter.findUnique({
        where: { order: data.order },
      });

      if (existingOrder) {
        return NextResponse.json({ error: 'Chapter with this order already exists' }, { status: 400 });
      }
    }

    // Handle title change and slug update
    let newSlug = existingChapter.slug;
    if (data.title && data.title !== existingChapter.title) {
      newSlug = slugify(data.title);

      // Check if new slug already exists
      if (newSlug !== existingChapter.slug) {
        const existingSlug = await prisma.chapter.findUnique({
          where: { slug: newSlug },
        });

        if (existingSlug) {
          return NextResponse.json({ error: 'Chapter with this title already exists' }, { status: 400 });
        }
      }
    }

    // Handle status change and publishedAt
    let publishedAt = existingChapter.publishedAt;
    if (data.status === 'PUBLISHED' && existingChapter.status !== 'PUBLISHED') {
      publishedAt = new Date();

      const users =
        (await prisma.user.findMany({
          where: { admin: false },
          select: { email: true, name: true },
        })) ?? [];

      await sendNewChapterNotification(users, {
        title: data.title || existingChapter.title,
        slug: newSlug,
      });
    }

    // Update the chapter
    const updatedChapter = await prisma.chapter.update({
      where: { slug: existingChapter.slug },
      data: {
        order: data.order,
        status: data.status,
        synopsis: data.synopsis,
        coverImageUrl: data.coverImageUrl,
        title: data.title,
        publishedAt,
        slug: newSlug,
      },
      select: {
        slug: true,
        title: true,
        order: true,
        status: true,
        synopsis: true,
        coverImageUrl: true,
      },
    });

    // Revalidate relevant paths
    revalidatePath(`/chapters/${updatedChapter.slug}`);
    revalidatePath(`/dashboard/chapters/${updatedChapter.slug}`);
    revalidatePath('/dashboard/chapters');
    revalidatePath('/'); // Home page that lists chapters

    // If slug changed, also revalidate old path
    if (newSlug !== existingChapter.slug) {
      revalidatePath(`/chapters/${existingChapter.slug}`);
      revalidatePath(`/dashboard/chapters/${existingChapter.slug}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Chapter updated successfully',
      data: updatedChapter,
    });
  } catch (error) {
    console.error('Error updating chapter:', error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: 'Failed to update chapter' }, { status: 500 });
  }
}
