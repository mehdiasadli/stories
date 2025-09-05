import NextAuth, { User } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from './prisma';
import * as bcrypt from 'bcryptjs';
import { LoginSchema } from './schemas/auth.schema';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const result = LoginSchema.safeParse(credentials);
        if (!result.success) {
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: result.data.email },
          });

          if (!user) {
            return null;
          }

          const passwordsMatch = await bcrypt.compare(result.data.password, user.password);
          if (!passwordsMatch) {
            return null;
          }

          if (user.isVerified === false) {
            return null;
          }

          const resultUser: User = {
            id: user.id,
            slug: user.slug,
            admin: user.admin,
            email: user.email,
            name: user.name,
          };

          return resultUser;
        } catch (e) {
          console.error(e);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.slug = user.slug;
        token.admin = user.admin;
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.slug = token.slug;
        session.user.admin = token.admin;
        session.user.name = token.name!;
        session.user.email = token.email!;
      }

      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return url;
      if (url.startsWith(baseUrl)) return url;
      return baseUrl;
    },
  },
  pages: {
    signIn: '/auth/login',
  },
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.AUTH_SECRET,
});
