import { z } from 'zod';
import { NotificationTypeSchema } from './enums.schema';

export const NotificationSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  title: z.string().min(1).max(255),
  content: z.string().min(1).max(1000),
  type: NotificationTypeSchema,
  link: z.string().optional(),
  linkText: z.string().optional(),
  acceptLink: z.string().optional(),
  acceptLinkText: z.string().optional(),
  rejectLink: z.string().optional(),
  rejectLinkText: z.string().optional(),
  userId: z.string().uuid(),
  read: z.boolean().default(false),
});

export const NotificationCreateSchema = NotificationSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  read: true,
});

export type TNotification = z.infer<typeof NotificationSchema>;
export type TNotificationCreate = z.infer<typeof NotificationCreateSchema>;
