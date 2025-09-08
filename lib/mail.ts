import Mailjet from 'node-mailjet';
import { emailVerificationTemplate } from './email-templates/verification.template';
import { respond } from './response';
import { Chapter } from '@prisma/client';
import { newChapterNotificationTemplate } from './email-templates/new-chapter-notification.template';

const mailjet = new Mailjet({
  apiKey: process.env.MAILJET_API_KEY,
  apiSecret: process.env.MAILJET_API_SECRET,
});

export async function sendEmailVerification(email: string, token: string, expiresAt: Date, name: string) {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    const verificationUrl = `${appUrl}/auth/verify/${token}`;
    const emailTemplate = emailVerificationTemplate(verificationUrl, expiresAt, name);

    const result = await mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: { Email: process.env.MAILJET_FROM_EMAIL, Name: process.env.MAIL_SENDER_NAME },
          Subject: 'e-poçtunu təsdiq et • mahmud',
          CustomID: `${token}-${Date.now()}-email-verification`.substring(0, 40),
          To: [{ Email: email, Name: name }],
          HTMLPart: emailTemplate,
        },
      ],
    });

    return respond.success(result.body, 'təsdiq e-poçtu uğurla göndərildi');
  } catch (e) {
    console.error(e);
    return respond.error(e);
  }
}

export async function sendNewChapterNotification(
  users: { email: string; name: string }[],
  chapter: {
    title: string;
    slug: string;
  }
) {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    const chapterUrl = `${appUrl}/chapters/${chapter.slug}`;
    const emailTemplate = newChapterNotificationTemplate(chapterUrl, chapter.title);

    const result = await mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: { Email: process.env.MAILJET_FROM_EMAIL, Name: process.env.MAIL_SENDER_NAME },
          Subject: `${chapter.title} bölümü paylaşıldı • mahmud`,
          CustomID: `${chapter.slug}-${Date.now()}-new-chapter-notification`.substring(0, 40),
          To: users.map((user) => ({ Email: user.email, Name: user.name })),
          HTMLPart: emailTemplate,
        },
      ],
    });

    return respond.success(result.body, 'yeni bölüm haqda xəbər göndərildi');
  } catch (e) {
    console.error(e);
    return respond.error(e);
  }
}
