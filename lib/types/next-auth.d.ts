import { DefaultUser } from 'next-auth';
import { DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      slug: string;
      admin: boolean;
      name: string;
      email: string;
    };
  }

  interface User extends DefaultUser {
    id: string;
    slug: string;
    admin: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string;
    slug: string;
    admin: boolean;
  }
}
