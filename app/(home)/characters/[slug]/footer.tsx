import { CharacterShareOptions } from './share-options';
import { Chapter, Character, CharacterAppearanceType } from '@prisma/client';
import { CharacterActions } from './character-actions';
import Link from 'next/link';

interface CharacterFooterProps {
  character: Character & {
    chapters: {
      chapter: Pick<Chapter, 'id' | 'slug' | 'title' | 'order' | 'publishedAt'>;
      appearanceType: CharacterAppearanceType;
      note?: string | null;
      quotesAndThoughts?: string[];
    }[];
    _count: {
      views: number;
      favorites: number;
      chapters: number;
    };
  };
  authorId: string;
}

export function CharacterFooter({ character, authorId }: CharacterFooterProps) {
  return (
    <div className='mt-16 pt-8 border-t border-gray-200 text-center space-y-6'>
      {/* Quick Actions */}
      <div className='flex items-center justify-center gap-6 text-sm'>
        <CharacterActions characterSlug={character.slug} authorId={authorId} />

        {character.published && (
          <CharacterShareOptions
            characterName={character.name}
            characterUrl={`${process.env.NEXT_PUBLIC_APP_URL}/characters/${character.slug}`}
          />
        )}
      </div>
      <div className='pt-4 border-t border-gray-200 text-xs text-gray-500 space-y-1'>
        <div className='flex items-center gap-2 justify-center'>
          <Link
            href={`/characters/${character.slug}/views`}
            className='hover:text-gray-900 hover:underline transition-colors'
          >
            <p>{character._count.views} baxış</p>
          </Link>
          <p>•</p>
          <Link
            href={`/characters/${character.slug}/favorites`}
            className='hover:text-gray-900 hover:underline transition-colors'
          >
            <p>{character._count.favorites} favorit</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
