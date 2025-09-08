import { Chapter, Character, CharacterAppearanceType } from '@prisma/client';
import Link from 'next/link';

interface CharacterCardProps {
  character: Character & {
    _count: {
      chapters: number;
      favorites: number;
      views: number;
    };
    chapters: {
      chapter: Pick<Chapter, 'slug' | 'title' | 'order'>;
      appearanceType: CharacterAppearanceType;
      note?: string | null;
      quotesAndThoughts?: string[];
    }[];
  };
}

export function CharacterCard({ character }: CharacterCardProps) {
  const appearedInChapters = character.chapters.filter(
    (chapter) => chapter.appearanceType === CharacterAppearanceType.APPEARANCE
  );
  const mentionedInChapters = character.chapters.filter(
    (chapter) => chapter.appearanceType === CharacterAppearanceType.MENTION
  );
  const povInChapters = character.chapters.filter((chapter) => chapter.appearanceType === CharacterAppearanceType.POV);

  const info = `${character.dateOfBirth ? `${character.dateOfBirth}` : ''}${character.placeOfBirth ? `, ${character.placeOfBirth}` : ''}`;
  const appearanceStatus =
    povInChapters.length > 0
      ? 'POV'
      : appearedInChapters.length > 0
        ? 'İştirak etdi'
        : mentionedInChapters.length > 0
          ? 'Adı keçdi'
          : '';

  return (
    <Link href={`/characters/${character.slug}`}>
      <article className='border border-gray-200 hover:border-gray-400 transition-colors p-6 bg-white flex flex-col group h-[240px]'>
        <div className='flex items-center justify-between mb-4'>
          <span className='text-xs text-gray-700 bg-white border border-gray-300 px-2 py-1'>
            {info.length > 0 ? info : 'məlum deyil'}
          </span>
          <span className='text-xs text-gray-500'>{appearanceStatus}</span>
        </div>

        <h3 className='text-lg font-serif text-gray-900 mb-3 group-hover:text-gray-700 transition-colors'>
          {character.name}
        </h3>

        {character.description && (
          <p className='text-xs text-gray-500 leading-relaxed mb-4'>
            {character.description.length > 130 ? character.description.slice(0, 130) + '...' : character.description}
          </p>
        )}

        <div className='mt-auto pt-4 border-t border-gray-100 flex items-center justify-between'>
          <p className='text-xs text-gray-500'>{character._count.views} baxış</p>
          <p className='text-xs text-gray-500'>•</p>
          <p className='text-xs text-gray-500'>{character._count.favorites} favorit</p>
          <p className='text-xs text-gray-500'>•</p>
          <p className='text-xs text-gray-500'>{character._count.chapters} bölüm</p>
        </div>
      </article>
    </Link>
  );
}
