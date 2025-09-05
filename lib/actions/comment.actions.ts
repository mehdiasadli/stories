/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '../auth';
import { prisma } from '../prisma';
import { respond, TResponse } from '../response';
import { CommentCreateSchema, CommentDeleteSchema, CommentUpdateSchema, TComment } from '../schemas/comment.schema';
import { slugify } from '../utils';

export async function createComment(previousState: any, formData: FormData): Promise<TResponse<TComment>> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return respond.error('Unauthorized');
    }

    const data = CommentCreateSchema.parse({
      content: formData.get('content'),
      parentId: formData.get('parentId'),
      chapterSlug: formData.get('chapterSlug'),
    });

    const chapter = await prisma.chapter.findUnique({
      where: {
        slug: data.chapterSlug,
      },
      select: {
        id: true,
      },
    });

    if (!chapter) {
      return respond.error('Chapter not found');
    }

    const { chapterSlug, ...rest } = data;

    const comment = await prisma.comment.create({
      data: {
        ...rest,
        userId: session.user.id,
        slug: slugify(data.content),
        parentId: rest.parentId || undefined,
        chapterId: chapter.id,
      },
    });

    revalidatePath(`/chapters/${chapterSlug}/discussion`);
    revalidatePath(`/chapters/${chapterSlug}`);

    return respond.success(comment, 'Comment created successfully');
  } catch (e) {
    console.error(e);
    return respond.error(e);
  }
}

export async function updateComment(previousState: any, formData: FormData): Promise<TResponse<TComment>> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return respond.error('Unauthorized');
    }

    const data = CommentUpdateSchema.parse({
      id: formData.get('id'),
      content: formData.get('content'),
    });

    const existingComment = await prisma.comment.findUnique({
      where: { id: data.id },
      include: {
        chapter: {
          select: { slug: true, authorId: true },
        },
      },
    });

    if (!existingComment) {
      return respond.error('Comment not found');
    }

    // Only comment author or chapter author can update
    if (existingComment.userId !== session.user.id && existingComment.chapter.authorId !== session.user.id) {
      return respond.error('Unauthorized to update this comment');
    }

    const updatedComment = await prisma.comment.update({
      where: { id: data.id },
      data: {
        content: data.content,
        slug: slugify(data.content),
      },
    });

    revalidatePath(`/chapters/${existingComment.chapter.slug}/discussion`);
    revalidatePath(`/chapters/${existingComment.chapter.slug}`);

    return respond.success(updatedComment, 'Comment updated successfully');
  } catch (e) {
    console.error(e);
    return respond.error(e);
  }
}

export async function deleteComment(previousState: any, formData: FormData): Promise<TResponse<{ id: string }>> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return respond.error('Unauthorized');
    }

    const data = CommentDeleteSchema.parse({
      id: formData.get('id'),
    });

    const existingComment = await prisma.comment.findUnique({
      where: { id: data.id },
      include: {
        chapter: {
          select: { slug: true, authorId: true },
        },
      },
    });

    if (!existingComment) {
      return respond.error('Comment not found');
    }

    // Only comment author or chapter author can delete
    if (existingComment.userId !== session.user.id && existingComment.chapter.authorId !== session.user.id) {
      return respond.error('Unauthorized to delete this comment');
    }

    await prisma.comment.delete({
      where: { id: data.id },
    });

    revalidatePath(`/chapters/${existingComment.chapter.slug}/discussion`);
    revalidatePath(`/chapters/${existingComment.chapter.slug}`);

    return respond.success({ id: data.id }, 'Comment deleted successfully');
  } catch (e) {
    console.error(e);
    return respond.error(e);
  }
}
