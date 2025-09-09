import { z } from 'zod';

export const ContentStatusSchema = z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']);
export const CharacterAppearanceTypeSchema = z.enum(['POV', 'APPEARANCE', 'MENTION']);
export const CharacterGenderSchema = z.enum(['MALE', 'FEMALE', 'NOT_SPECIFIED', 'OTHER']);
export const CharacterRelationTypeSchema = z.enum(['PARENT', 'SIBLING', 'SPOUSE', 'CHILD', 'LOVER']);
export const NotificationTypeSchema = z.enum([
  'NEW_CHAPTER_PUBLISHED', // done
  'NEW_CHAPTER_COMMENT', // done
  'NEW_CHAPTER_READ', // done
  'NEW_CHAPTER_FAVORITE', // done
  'NEW_CHARACTER_PUBLISHED', // done
  'NEW_CHARACTER_FAVORITE',
  'NEW_CHARACTER_VIEW',
  'NEW_COMMENT_REPLY', // done
]);

export type TContentStatus = z.infer<typeof ContentStatusSchema>;
export type TCharacterAppearanceType = z.infer<typeof CharacterAppearanceTypeSchema>;
export type TCharacterGender = z.infer<typeof CharacterGenderSchema>;
export type TCharacterRelationType = z.infer<typeof CharacterRelationTypeSchema>;
export type TNotificationType = z.infer<typeof NotificationTypeSchema>;
