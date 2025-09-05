import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllCharacters, getAuthorId, getCharacter } from '@/lib/fetchers';
import { CharacterInfoBox } from './info-box';
import { CharacterAppearances } from './character-appearances';
import { CharacterFooter } from './footer';
import { CharacterArticle } from './character-article';
import { CharacterHeader } from './character-header';

export const revalidate = 300; // 5 minutes
export const dynamicParams = true; // Allow dynamic params for newly published characters

export async function generateStaticParams() {
  const characters = await getAllCharacters();

  return characters.map((character) => ({
    slug: character.slug,
  }));
}

export async function generateMetadata({ params }: CharacterPageProps): Promise<Metadata> {
  const { slug } = await params;

  const character = await getCharacter(slug);

  if (!character || !character.published) {
    return {
      title: 'Tapılmadı',
    };
  }

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
    },
    openGraph: {
      title: openGraphTitle,
      description,
      url: `${process.env.NEXT_PUBLIC_APP_URL}/characters/${character.slug}`,
      type: 'profile',
      images: character.profileImageUrl ? [character.profileImageUrl] : undefined,
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

  if (!character || !character.published || !authorId) {
    notFound();
  }

  return (
    <div className='min-h-screen bg-white'>
      <div className='max-w-6xl mx-auto px-4 py-8'>
        {/* Header */}
        <CharacterHeader name={character.name} slug={slug} />

        {/* Wikipedia-style Layout */}
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

        {/* Footer */}
        <CharacterFooter character={character} authorId={authorId} />
      </div>
    </div>
  );
}
