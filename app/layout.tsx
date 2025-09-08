import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { SessionProvider } from 'next-auth/react';
import { az } from 'date-fns/locale';
import { Analytics } from '@vercel/analytics/react';
import { GoogleAnalytics } from '@next/third-parties/google';
import { setDefaultOptions } from 'date-fns';

setDefaultOptions({ locale: az });

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL!),
  title: {
    template: '%s • mahmud',
    default: 'mahmud',
  },
  description:
    '"mahmud" ölümsüz bir insanın başlanğıcını axtardığı və bunun üçün əsrlər boyu dünya üzərində etdiyi səyahətlərinin anlatıldığı bir fantastik romandır.',
  keywords: [
    'mahmud',
    'mahmud novel',
    'mahmud book',
    'mahmud reading',
    'mahmud review',
    'mahmud author',
    'mahmud characters',
    'novel',
    'fantasy',
    'Mahmud',
    'online reading',
    'reading',
    'stories',
    'chapters',
    'literature',
    'fiction',
    'books',
    'online books',
  ],
  authors: [{ name: 'Mehdi Asadli', url: `${process.env.NEXT_PUBLIC_APP_URL}/users/mehdi-asadli` }],
  creator: 'Mehdi Asadli',
  publisher: 'Mehdi Asadli',
  applicationName: 'mahmud',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'az',
    url: `${process.env.NEXT_PUBLIC_APP_URL}`,
    title: 'mahmud',
    siteName: 'mahmud',
    description:
      '"mahmud" ölümsüz bir insanın başlanğıcını axtardığı və bunun üçün əsrlər boyu dünya üzərində etdiyi səyahətlərinin anlatıldığı bir fantastik romandır.',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'mahmud',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_APP_URL}`,
  },
};

export const viewport: Viewport = {
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <head>
        <meta name='apple-mobile-web-app-title' content='mahmud' />
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID!} />
      </head>

      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SessionProvider>{children}</SessionProvider>
        <Analytics />
      </body>
    </html>
  );
}
