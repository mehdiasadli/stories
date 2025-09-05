import { z } from 'zod';
import { SLUG_REGEX } from '../regexes';

export const UserSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  email: z.string().email(),
  slug: z.string().regex(SLUG_REGEX),
  name: z.string().min(2).max(50),
  password: z.string().min(8).max(50),
  admin: z.boolean(),
  isVerified: z.boolean(),
});

export const UserUpdateSchema = UserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  admin: true,
  email: true,
  slug: true,
  password: true,
  isVerified: true,
  name: true,
}).partial();

export const UserCreateSchema = UserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  slug: true,
  admin: true,
  isVerified: true,
});

export type TUser = z.infer<typeof UserSchema>;
export type TPublicUser = Omit<TUser, 'password' | 'isVerified' | 'updatedAt' | 'createdAt' | 'id'>;
export type TUserUpdate = z.infer<typeof UserUpdateSchema>;
export type TUserCreate = z.infer<typeof UserCreateSchema>;
