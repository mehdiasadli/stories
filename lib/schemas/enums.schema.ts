import { z } from 'zod';

export const ContentStatusSchema = z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']);
export const CharacterAppearanceTypeSchema = z.enum(['POV', 'APPEARANCE', 'MENTION']);
export const CharacterGenderSchema = z.enum(['MALE', 'FEMALE', 'NOT_SPECIFIED', 'OTHER']);
export const CharacterRelationTypeSchema = z.enum(['PARENT', 'SIBLING', 'SPOUSE', 'CHILD', 'LOVER']);

export type TContentStatus = z.infer<typeof ContentStatusSchema>;
export type TCharacterAppearanceType = z.infer<typeof CharacterAppearanceTypeSchema>;
export type TCharacterGender = z.infer<typeof CharacterGenderSchema>;
export type TCharacterRelationType = z.infer<typeof CharacterRelationTypeSchema>;
