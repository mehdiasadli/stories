import z from 'zod';
import { SLUG_REGEX } from '../regexes';
import { ContentStatusSchema } from './enums.schema';

export const ChapterSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  publishedAt: z.coerce.date().nullish(),
  slug: z.string().regex(SLUG_REGEX),
  order: z.coerce.number().int().min(1),
  title: z.string().min(1).max(127),
  synopsis: z.string().max(512).nullish(),
  status: ContentStatusSchema,
  content: z.string(),
  previousContent: z.string(),
  wordCount: z.number().int().min(0),
  coverImageUrl: z.string().url().nullish(),
  authorId: z.string().uuid(),
});

export const ChapterCreateSchema = ChapterSchema.pick({
  order: true,
  title: true,
  synopsis: true,
  coverImageUrl: true,
});

export const ChapterUpdateSchema = ChapterSchema.partial().pick({
  slug: true, // to get the item
  title: true,
  order: true,
  synopsis: true,
  status: true,
  coverImageUrl: true,
});

export const ChapterContentUpdateSchema = ChapterSchema.partial().pick({
  content: true,
});

export const ChapterDeleteSchema = ChapterSchema.pick({
  slug: true, // to get the item
  title: true, // to verify the title
});

export const ChapterReloadPreviousContentSchema = ChapterSchema.pick({
  slug: true, // to get the item
});

export const ChapterSearchOrderSchema = z.enum([
  'newest', // order by chapter.order descending (latest chapters first)
  'oldest', // order by chapter.order ascending (earliest chapters first)
  'alphabetical-asc', // order by title A-Z
  'alphabetical-desc', // order by title Z-A
  'most-comments', // order by comments count descending
  'most-read', // order by reads count descending
  'most-favorited', // order by favorites count descending
  'longest', // order by wordCount descending
  'shortest', // order by wordCount ascending
  'popular', // order by combined score (reads + favorites + comments)
  'rising', // order by combined score with recency boost
]);

export const ChapterSearchOfUserOrderSchema = z.enum([
  'newest', // recent read, favorite or comment
  'oldest', // oldest read, favorite or comment
  'alphabetical-asc', // order by title of chapter A-Z
  'alphabetical-desc', // order by title of chapter Z-A
  'longest', // order by wordCount descending
  'shortest', // order by wordCount ascending
]);

export const ChapterDateRangeSchema = z.enum(['today', 'this-week', 'this-month', 'this-year', 'all-time']);

export const ChapterStatusFilterSchema = z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']);

export const ChapterSearchSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  q: z.string().optional(),
  order: ChapterSearchOrderSchema.default('newest'),
  dateRange: ChapterDateRangeSchema.default('all-time'),
  status: z.array(ChapterStatusFilterSchema).optional(),
});

export const ChapterSearchOfUserSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  // order: ChapterSearchOfUserOrderSchema.default('newest'),
  // dateRange: ChapterDateRangeSchema.default('all-time'),
});

export const ChapterSearchOfUserResourceSchema = z.enum(['comments', 'favorites', 'reads']);

export type TChapter = z.infer<typeof ChapterSchema>;
export type TChapterCreate = z.infer<typeof ChapterCreateSchema>;
export type TChapterUpdate = z.infer<typeof ChapterUpdateSchema>;
export type TChapterContentUpdate = z.infer<typeof ChapterContentUpdateSchema>;
export type TChapterDelete = z.infer<typeof ChapterDeleteSchema>;
export type TChapterReloadPreviousContent = z.infer<typeof ChapterReloadPreviousContentSchema>;
export type TChapterSearchOrder = z.infer<typeof ChapterSearchOrderSchema>;
export type TChapterDateRange = z.infer<typeof ChapterDateRangeSchema>;
export type TChapterStatusFilter = z.infer<typeof ChapterStatusFilterSchema>;
export type TChapterSearch = z.infer<typeof ChapterSearchSchema>;
export type TChapterSearchOfUserOrder = z.infer<typeof ChapterSearchOfUserOrderSchema>;
export type TChapterSearchOfUser = z.infer<typeof ChapterSearchOfUserSchema>;
export type TChapterSearchOfUserResource = z.infer<typeof ChapterSearchOfUserResourceSchema>;
