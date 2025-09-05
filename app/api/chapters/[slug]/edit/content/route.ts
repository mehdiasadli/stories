import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { respond } from '@/lib/response';
import { ChapterContentUpdateSchema } from '@/lib/schemas/chapter.schema';
import { getWordCount } from '@/lib/utils';
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
    const authorId = session.user.id;
    const data = ChapterContentUpdateSchema.parse(body);

    const existingChapter = await prisma.chapter.findUnique({
      where: {
        slug,
      },
      select: {
        slug: true,
        content: true,
        authorId: true,
      },
    });

    if (!existingChapter) {
      return NextResponse.json(respond.error('Chapter not found'), { status: 404 });
    }

    if (existingChapter.authorId !== authorId) {
      return NextResponse.json(respond.error('Only the author can update the content of this chapter'), {
        status: 403,
      });
    }

    const prevContent = existingChapter.content;
    const newContent = data.content;
    const wordCount = getWordCount(newContent ?? '', true);

    const chapter = await prisma.chapter.update({
      where: { slug },
      data: { content: newContent, previousContent: prevContent, wordCount },
      select: { slug: true },
    });

    revalidatePath(`/chapters/${chapter.slug}`);
    revalidatePath(`/dashboard/chapters/${chapter.slug}`);
    revalidatePath('/dashboard/chapters');
    revalidatePath('/');

    return NextResponse.json(respond.success(chapter, 'Chapter content updated successfully'), { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(respond.error(e), { status: 500 });
  }
}
