import z from 'zod';
import { ChapterSchema } from './chapter.schema';

export const CommentSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  content: z.string().min(1).max(1000),
  depth: z.number().int().min(1).max(5),
  userId: z.string().uuid(),
  chapterId: z.string().uuid(),
  parentId: z.string().uuid().nullish(),
});

export const CommentCreateSchema = CommentSchema.pick({
  content: true,
  parentId: true,
}).extend({
  chapterSlug: ChapterSchema.shape.slug,
});

export const CommentUpdateSchema = CommentSchema.pick({
  id: true,
  content: true,
});

export const CommentDeleteSchema = CommentSchema.pick({
  id: true,
});

export type TComment = z.infer<typeof CommentSchema>;
export type TCommentCreate = z.infer<typeof CommentCreateSchema>;
export type TCommentUpdate = z.infer<typeof CommentUpdateSchema>;
export type TCommentDelete = z.infer<typeof CommentDeleteSchema>;
