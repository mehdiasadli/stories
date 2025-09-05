import z from 'zod';
import { DATE_REGEX, PLACE_REGEX, SLUG_REGEX } from '../regexes';
import { CharacterGenderSchema } from './enums.schema';

export const CharacterSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  published: z.boolean().default(false),
  slug: z.string().regex(SLUG_REGEX),
  name: z.string().min(1).max(127),
  nameDescription: z.string().max(64).nullish(),
  description: z.string().max(256).nullish(),
  titles: z.array(z.string()).nullish(),
  aliases: z.array(z.string()).nullish(),
  wiki: z.string().nullish(),
  profileImageUrl: z.string().url().nullish(),
  dateOfBirth: z.string().regex(DATE_REGEX).nullish(),
  dateOfDeath: z.string().regex(DATE_REGEX).nullish(),
  placeOfBirth: z.string().regex(PLACE_REGEX).nullish(),
  placeOfDeath: z.string().regex(PLACE_REGEX).nullish(),
  birthDescription: z.string().max(256).nullish(),
  deathDescription: z.string().max(256).nullish(),
  gender: CharacterGenderSchema,
});

export const CharacterCreateSchema = CharacterSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  slug: true,
  wiki: true,
});

export const CharacterUpdateSchema = CharacterSchema.partial().omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  slug: true,
  wiki: true,
});

export const CharacterDeleteSchema = CharacterSchema.pick({
  slug: true,
  name: true,
});

export const CharacterWikiUpdateSchema = CharacterSchema.partial().pick({
  wiki: true,
});

export const CharacterSearchOrderSchema = z.enum([
  'alphabetical-asc',
  'alphabetical-desc',
  'newest',
  'oldest',
  'most-pov',
  'most-appeared',
  'most-mentioned',
]);

export const CharacterSearchSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  q: z.string().optional(),
});

export type TCharacter = z.infer<typeof CharacterSchema>;
export type TCharacterCreate = z.infer<typeof CharacterCreateSchema>;
export type TCharacterUpdate = z.infer<typeof CharacterUpdateSchema>;
export type TCharacterDelete = z.infer<typeof CharacterDeleteSchema>;
export type TCharacterWikiUpdate = z.infer<typeof CharacterWikiUpdateSchema>;
export type TCharacterSearch = z.infer<typeof CharacterSearchSchema>;
