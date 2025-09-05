import { CharacterShareOptions } from './share-options';
import { Chapter, Character, CharacterAppearanceType } from '@prisma/client';
import { CharacterActions } from './character-actions';

interface CharacterFooterProps {
  character: Character & {
    chapters: {
      chapter: Pick<Chapter, 'id' | 'slug' | 'title' | 'order' | 'publishedAt'>;
      appearanceType: CharacterAppearanceType;
      note?: string | null;
      quotesAndThoughts?: string[];
    }[];
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
    </div>
  );
}
