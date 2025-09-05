'use server';

import { prisma } from '../prisma';
import { respond, TResponse } from '../response';
import { UserCreateSchema } from '../schemas/user.schema';
import { slugify } from '../utils';
import { nanoid } from 'nanoid';
import * as bcrypt from 'bcryptjs';
import { sendEmailVerification } from '../mail';
import { User } from 'next-auth';
import { ResendVerificationSchema } from '../schemas/auth.schema';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function signUp(previousState: any, formData: FormData): Promise<TResponse<User>> {
  try {
    const data = UserCreateSchema.parse({
      name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password'),
    });
    const slug = slugify(data.name);

    const existingUser = await prisma.user.findUnique({
      where: {
        slug,
      },
    });

    if (existingUser) {
      return respond.error('istifadəçi artıq mövcuddur. fərqli ad daxil edin.');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        ...data,
        slug,
        password: hashedPassword,
      },
      select: {
        name: true,
        email: true,
        id: true,
        slug: true,
        admin: true,
      },
    });

    const emailVerificationToken = await prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        token: nanoid(32),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 1 day
      },
    });

    const emailResult = await sendEmailVerification(
      user.email,
      emailVerificationToken.token,
      emailVerificationToken.expiresAt,
      user.name
    );

    if (!emailResult.success) {
      await prisma.user.delete({
        where: { id: user.id },
      });

      return respond.error('istifadəçi yaradıla bilmədi. yenidən cəhd edin.');
    }

    const result: User = {
      id: user.id,
      slug: user.slug,
      email: user.email,
      name: user.name,
      admin: user.admin,
    };

    return respond.success(result, 'istifadəçi uğurla yaradıldı. təsdiq e-poçtunu (və `spam` qovluğunu) yoxlayın.');
  } catch (e) {
    console.error(e);
    return respond.error(e);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function resendVerification(previousState: any, formData: FormData): Promise<TResponse<User>> {
  try {
    const data = ResendVerificationSchema.parse({
      email: decodeURIComponent((formData.get('email') || '') as string),
    });

    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      return respond.error('istifadəçi tapılmadı');
    }

    if (user.isVerified) {
      return respond.error('istifadəçi artıq təsdiq edilib. daxil ol səhifəsinə keç.');
    }

    // remove all existing email verification tokens
    await prisma.emailVerificationToken.deleteMany({
      where: { userId: user.id },
    });

    const emailVerificationToken = await prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        token: nanoid(32),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 1 day
      },
    });

    const emailResult = await sendEmailVerification(
      user.email,
      emailVerificationToken.token,
      emailVerificationToken.expiresAt,
      user.name
    );

    if (!emailResult.success) {
      await prisma.user.delete({
        where: { id: user.id },
      });

      return respond.error('istifadəçi yaradıla bilmədi. yenidən cəhd edin.');
    }

    const result: User = {
      id: user.id,
      slug: user.slug,
      email: user.email,
      name: user.name,
      admin: user.admin,
    };

    return respond.success(result, 'istifadəçi uğurla yaradıldı. təsdiq e-poçtunu (və `spam` qovluğunu) yoxlayın.');
  } catch (e) {
    console.error(e);
    return respond.error(e);
  }
}

export async function verifyEmail(
  token: string
): Promise<TResponse<User> & { status: 'success' | 'invalid' | 'verified' | 'expired' }> {
  try {
    const emailVerificationToken = await prisma.emailVerificationToken.findUnique({
      where: { token },
      include: { user: { select: { id: true, name: true, isVerified: true } } },
    });

    if (!emailVerificationToken || !emailVerificationToken.user) {
      return { ...respond.error('düzgün olmayan təsdiq tokeni'), status: 'invalid' };
    }

    if (emailVerificationToken.user.isVerified) {
      await prisma.emailVerificationToken.delete({
        where: { id: emailVerificationToken.id },
      });

      return { ...respond.error('istifadəçi artıq təsdiq edilib. daxil ol səhifəsinə keç.'), status: 'verified' };
    }

    if (emailVerificationToken.expiresAt < new Date()) {
      await prisma.emailVerificationToken.delete({
        where: { id: emailVerificationToken.id },
      });

      return { ...respond.error('düzgün olmayan təsdiq tokeni'), status: 'expired' };
    }

    return await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: emailVerificationToken.user.id },
        data: { isVerified: true },
        select: { id: true, name: true, slug: true, email: true, admin: true },
      });

      await tx.emailVerificationToken.delete({
        where: { id: emailVerificationToken.id },
      });

      return { ...respond.success(user, 'e-poçtunuz təsdiq edildi. daxil ol səhifəsinə keç.'), status: 'success' };
    });
  } catch (e) {
    console.error(e);
    return { ...respond.error(e), status: 'invalid' };
  }
}
