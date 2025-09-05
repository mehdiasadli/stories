/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { auth } from '../auth';
import { prisma } from '../prisma';
import { respond, TResponse } from '../response';
import { getWordCount, slugify } from '../utils';
import {
  ChapterCreateSchema,
  ChapterDeleteSchema,
  ChapterReloadPreviousContentSchema,
  ChapterUpdateSchema,
} from '../schemas/chapter.schema';

export async function createChapter(previousState: any, formData: FormData): Promise<TResponse<{ slug: string }>> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return respond.error('Unauthorized');
    }

    const authorId = session.user.id;
    const data = ChapterCreateSchema.parse({
      title: formData.get('title'),
      order: formData.get('order'),
      synopsis: formData.get('synopsis'),
      coverImageUrl: formData.get('coverImageUrl'),
    });
    const slug = slugify(data.title);

    const existingChapter = await prisma.chapter.findUnique({
      where: {
        slug,
      },
    });

    if (existingChapter) {
      return respond.error('Chapter with this title already exists');
    }

    const existingOrder = await prisma.chapter.findUnique({
      where: {
        order: data.order,
      },
    });

    if (existingOrder) {
      return respond.error('Chapter with this order already exists');
    }

    const chapter = await prisma.chapter.create({
      data: {
        ...data,
        slug,
        authorId,
      },
      select: {
        slug: true,
      },
    });

    return respond.success(chapter, 'Chapter created successfully');
  } catch (e) {
    console.error(e);
    return respond.error(e);
  }
}

export async function updateChapter(formData: FormData): Promise<TResponse<{ slug: string }>> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return respond.error('Unauthorized');
    }

    const authorId = session.user.id;
    const data = ChapterUpdateSchema.parse(formData);
    const slug = data.slug;

    const existingChapter = await prisma.chapter.findUnique({
      where: {
        slug,
      },
    });

    if (!existingChapter) {
      return respond.error('Chapter not found');
    }

    if (existingChapter.authorId !== authorId) {
      return respond.error('Only the author can update this chapter');
    }

    // if order is changed, check if it is unique
    if (data.order && data.order !== existingChapter.order) {
      const existingOrder = await prisma.chapter.findUnique({
        where: { order: data.order },
      });

      if (existingOrder) {
        return respond.error('Chapter with this order already exists');
      }
    }

    let publishedAt = existingChapter.publishedAt;
    if (data.status === 'PUBLISHED') {
      publishedAt = new Date();
    }

    // if title changed, update the slug as well
    let newSlug = existingChapter.slug;
    if (data.title && data.title !== existingChapter.title) {
      newSlug = slugify(data.title);
    }

    const chapter = await prisma.chapter.update({
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
      },
    });

    return respond.success(chapter, 'Chapter updated successfully');
  } catch (e) {
    console.error(e);
    return respond.error(e);
  }
}

export async function reloadPreviousContent(formData: FormData) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return respond.error('Unauthorized');
    }

    const authorId = session.user.id;
    const data = ChapterReloadPreviousContentSchema.parse(formData);
    const slug = data.slug;

    const existingChapter = await prisma.chapter.findUnique({
      where: { slug },
      select: { authorId: true, content: true, previousContent: true },
    });

    if (!existingChapter) {
      return respond.error('Chapter not found');
    }

    if (existingChapter.authorId !== authorId) {
      return respond.error('Only the author can reload the previous content of this chapter');
    }

    const newWordCount = getWordCount(existingChapter.previousContent, true);
    const chapter = await prisma.chapter.update({
      where: { slug },
      data: {
        content: existingChapter.previousContent,
        previousContent: existingChapter.content,
        wordCount: newWordCount,
      },
    });

    return respond.success(chapter, 'Previous content reloaded successfully');
  } catch (e) {
    console.error(e);
    return respond.error(e);
  }
}

export async function deleteChapter(formData: FormData): Promise<TResponse<{ slug: string }>> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return respond.error('Unauthorized');
    }

    const authorId = session.user.id;
    const data = ChapterDeleteSchema.parse(formData);
    const slug = data.slug;

    const existingChapter = await prisma.chapter.findUnique({
      where: { slug },
      select: { authorId: true, title: true },
    });

    if (!existingChapter) {
      return respond.error('Chapter not found');
    }

    if (existingChapter.authorId !== authorId) {
      return respond.error('Only the author can delete this chapter');
    }

    if (existingChapter.title !== data.title) {
      return respond.error('Chapter title does not match');
    }

    await prisma.chapter.delete({
      where: { slug },
    });

    return respond.success(data, 'Chapter deleted successfully');
  } catch (e) {
    console.error(e);
    return respond.error(e);
  }
}
