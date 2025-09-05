import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(50),
});

export const ResendVerificationSchema = z.object({
  email: z.string().email(),
});

export type TLogin = z.infer<typeof LoginSchema>;
export type TResendVerification = z.infer<typeof ResendVerificationSchema>;
