import { MetadataRoute } from 'next';

export default function Robots(): MetadataRoute.Robots {
  return {
    sitemap: `${process.env.NEXT_PUBLIC_APP_URL}/sitemap.xml`,
    rules: {
      userAgent: '*',
      allow: '/',
    },
  };
}
