import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllCharacters, getAuthorId, getCharacter } from '@/lib/fetchers';
import { CharacterInfoBox } from './info-box';
import { CharacterAppearances } from './character-appearances';
import { CharacterFooter } from './footer';
import { CharacterArticle } from './character-article';
import { CharacterHeader } from './character-header';
import { auth } from '@/lib/auth';

export const revalidate = 300; // 5 minutes
export const dynamicParams = true; // Allow dynamic params for newly published characters

export async function generateStaticParams() {
  const characters = await getAllCharacters('published');

  return characters.map((character) => ({
    slug: character.slug,
  }));
}

export async function generateMetadata({ params }: CharacterPageProps): Promise<Metadata> {
  const { slug } = await params;
  const authorId = await getAuthorId();
  const character = await getCharacter(slug);

  if (!character || !character.published) {
    return {
      title: 'personaj tapılmadı',
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const openGraphTitle = `${character.name} • mahmud əsərinin personajı.`;
  const description =
    character.description || character.nameDescription || `${character.name} haqqında məlumat toplayın`;

  return {
    title: character.name,
    description,
    keywords: [
      'character',
      'personaj',
      'mahmud',
      character.name,
      character.description,
      character.titles?.join(', '),
      character.aliases?.join(', '),
    ].filter(Boolean) as string[],
    twitter: {
      title: openGraphTitle,
      description,
      card: 'summary_large_image',
      images: [`${baseUrl}/api/og/characters/${slug}`],
    },
    openGraph: {
      title: openGraphTitle,
      description,
      url: `${baseUrl}/characters/${character.slug}`,
      type: 'profile',
      images: [
        {
          url: `${baseUrl}/api/og/characters/${slug}`,
          width: 1200,
          height: 630,
          alt: openGraphTitle,
        },
      ],
    },
  };
}

interface CharacterPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CharacterPage({ params }: CharacterPageProps) {
  const { slug } = await params;

  const character = await getCharacter(slug);
  const authorId = await getAuthorId();
  const session = await auth();
  const userId = session?.user?.id;

  if (!character || !character.published || !authorId) {
    notFound();
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: character.name,
    image: `${baseUrl}/api/og/characters/${slug}`,
    description: character.description || character.nameDescription || `${character.name} - mahmud əsərinin personajı.`,
    url: `${baseUrl}/characters/${character.slug}`,
    type: 'profile',
    keywords: ['character', 'personaj', 'mahmud', character.name, character.description],
    about: ['character', 'personaj', 'mahmud', character.name, character.description],
    isPartOf: {
      '@type': 'Book',
      name: 'mahmud',
      url: `${baseUrl}`,
      author: {
        '@type': 'Person',
        authorId,
      },
    },
  };

  return (
    <>
      <section>
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
        />
      </section>

      <div className='min-h-screen bg-white'>
        <div className='max-w-6xl mx-auto px-4 py-8'>
          {/* Header */}
          <CharacterHeader name={character.name} slug={slug} />

          {/* Wikipedia-style Layout */}
          {userId ? (
            <div className='flex flex-col lg:flex-row gap-8'>
              {/* Main Content */}
              <div className='flex-1'>
                {/* Description Blockquote */}
                <CharacterArticle character={character} />

                {/* Chapter Appearances */}
                {character.chapters && character.chapters.length > 0 && <CharacterAppearances character={character} />}
              </div>

              {/* Wikipedia-style Info Box */}
              <CharacterInfoBox character={character} />
            </div>
          ) : (
            <div className='text-center'>
              <p className='text-sm text-gray-500 mb-4'>------</p>
            </div>
          )}

          {/* Footer */}
          <CharacterFooter character={character} authorId={authorId} />
        </div>
      </div>
    </>
  );
}
