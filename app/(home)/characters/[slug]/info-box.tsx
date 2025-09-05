import { Chapter, Character, CharacterAppearanceType, CharacterGender } from '@prisma/client';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import Link from 'next/link';

const genderMap = {
  [CharacterGender.MALE]: 'kişi',
  [CharacterGender.FEMALE]: 'qadın',
  [CharacterGender.NOT_SPECIFIED]: 'qeyd olunmayıb',
  [CharacterGender.OTHER]: 'digər',
};

interface CharacterInfoBoxProps {
  character: Character & {
    chapters: {
      chapter: Pick<Chapter, 'id' | 'slug' | 'title' | 'order' | 'publishedAt'>;
      appearanceType: CharacterAppearanceType;
      note?: string | null;
      quotesAndThoughts?: string[];
    }[];
  };
}

export function CharacterInfoBox({ character }: CharacterInfoBoxProps) {
  return (
    <div className='lg:w-80 flex-shrink-0 order-first lg:order-last'>
      <div className='bg-gray-50 border border-gray-200 rounded-lg p-4 sticky top-8'>
        <h3 className='text-lg font-semibold text-gray-900 mb-4 border-b border-gray-300 pb-2'>
          {character.name}
          {character.nameDescription && (
            <span className='text-sm font-normal text-gray-600 ml-2'>({character.nameDescription})</span>
          )}
        </h3>

        {/* Character Image */}
        {character.profileImageUrl && (
          <div className='mb-4'>
            <Image
              height={512}
              width={512}
              src={character.profileImageUrl}
              alt={character.name}
              className='w-full h-64 object-cover rounded border border-gray-200'
            />
          </div>
        )}

        {/* Info Box Content */}
        <div className='space-y-3 text-sm'>
          {/* Titles */}
          {character.titles && character.titles.length > 0 && (
            <div>
              <span className='font-medium text-gray-900 block mb-1'>titullar</span>
              <p className='text-gray-700'>{character.titles.join(', ')}</p>
            </div>
          )}

          {/* Aliases */}
          {character.aliases && character.aliases.length > 0 && (
            <div>
              <span className='font-medium text-gray-900 block mb-1'>digər adları</span>
              <p className='text-gray-700'>{character.aliases.join(', ')}</p>
            </div>
          )}

          {/* Personal Information */}
          {(character.dateOfBirth ||
            character.placeOfBirth ||
            character.dateOfDeath ||
            character.placeOfDeath ||
            character.gender) && (
            <div>
              <span className='font-medium text-gray-900 block mb-2'>şəxsi məlumatlar</span>
              <div className='space-y-1'>
                {character.gender && (
                  <div className='flex'>
                    <span className='font-medium text-gray-600 w-20'>cins:</span>
                    <span className='text-gray-700 capitalize'>{genderMap[character.gender]}</span>
                  </div>
                )}

                {/* Birth Information */}
                {(character.dateOfBirth || character.placeOfBirth) && (
                  <div className='flex'>
                    <span className='font-medium text-gray-600 w-20'>doğum:</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className='text-gray-700 cursor-help'>
                          {character.dateOfBirth && character.placeOfBirth
                            ? `${character.dateOfBirth}, ${character.placeOfBirth}`
                            : character.dateOfBirth
                              ? character.dateOfBirth
                              : `${character.placeOfBirth}`}
                        </span>
                      </TooltipTrigger>
                      {character.birthDescription && (
                        <TooltipContent>
                          <p className='max-w-xs'>{character.birthDescription}</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </div>
                )}

                {/* Death Information */}
                {(character.dateOfDeath || character.placeOfDeath) && (
                  <div className='flex'>
                    <span className='font-medium text-gray-600 w-20'>ölüm:</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className='text-gray-700 cursor-help'>
                          {character.dateOfDeath && character.placeOfDeath
                            ? `${character.dateOfDeath}, ${character.placeOfDeath}`
                            : character.dateOfDeath
                              ? character.dateOfDeath
                              : `${character.placeOfDeath}`}
                        </span>
                      </TooltipTrigger>
                      {character.deathDescription && (
                        <TooltipContent>
                          <p className='max-w-xs'>{character.deathDescription}</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Appearance Tracking */}
          {character.chapters && character.chapters.length > 0 && (
            <div>
              <span className='font-medium text-gray-900 block mb-2'>iştiraklar</span>
              <div className='space-y-1 text-xs'>
                {(() => {
                  const appearances = character.chapters;

                  // Find first and last by chapter order
                  const firstAppeared = appearances
                    .filter((a) => a.appearanceType === 'APPEARANCE')
                    .sort((a, b) => a.chapter.order - b.chapter.order)[0];
                  const lastAppeared = appearances
                    .filter((a) => a.appearanceType === 'APPEARANCE')
                    .sort((a, b) => b.chapter.order - a.chapter.order)[0];

                  const firstMentioned = appearances
                    .filter((a) => a.appearanceType === 'MENTION')
                    .sort((a, b) => a.chapter.order - b.chapter.order)[0];
                  const lastMentioned = appearances
                    .filter((a) => a.appearanceType === 'MENTION')
                    .sort((a, b) => b.chapter.order - a.chapter.order)[0];

                  const firstPOV = appearances
                    .filter((a) => a.appearanceType === 'POV')
                    .sort((a, b) => a.chapter.order - b.chapter.order)[0];
                  const lastPOV = appearances
                    .filter((a) => a.appearanceType === 'POV')
                    .sort((a, b) => b.chapter.order - a.chapter.order)[0];

                  const items = [];

                  if (firstAppeared) {
                    items.push(
                      <div key='first-appeared' className='flex'>
                        <span className='font-medium text-gray-600 w-20'>ilk iştirak:</span>
                        <Link
                          href={`/chapters/${firstAppeared.chapter.slug}`}
                          className='text-gray-700 hover:text-gray-900 transition-colors'
                        >
                          {firstAppeared.chapter.title}
                        </Link>
                      </div>
                    );
                  }

                  if (lastAppeared && lastAppeared !== firstAppeared) {
                    items.push(
                      <div key='last-appeared' className='flex'>
                        <span className='font-medium text-gray-600 w-20'>son iştirak:</span>
                        <Link
                          href={`/chapters/${lastAppeared.chapter.slug}`}
                          className='text-gray-700 hover:text-gray-900 transition-colors'
                        >
                          {lastAppeared.chapter.title}
                        </Link>
                      </div>
                    );
                  }

                  if (firstMentioned) {
                    items.push(
                      <div key='first-mentioned' className='flex'>
                        <span className='font-medium text-gray-600 w-20'>ilk qeyd:</span>
                        <Link
                          href={`/chapters/${firstMentioned.chapter.slug}`}
                          className='text-gray-700 hover:text-gray-900 transition-colors'
                        >
                          {firstMentioned.chapter.title}
                        </Link>
                      </div>
                    );
                  }

                  if (lastMentioned && lastMentioned !== firstMentioned) {
                    items.push(
                      <div key='last-mentioned' className='flex'>
                        <span className='font-medium text-gray-600 w-20'>son qeyd:</span>
                        <Link
                          href={`/chapters/${lastMentioned.chapter.slug}`}
                          className='text-gray-700 hover:text-gray-900 transition-colors'
                        >
                          {lastMentioned.chapter.title}
                        </Link>
                      </div>
                    );
                  }

                  if (firstPOV) {
                    items.push(
                      <div key='first-pov' className='flex'>
                        <span className='font-medium text-gray-600 w-20'>ilk pov:</span>
                        <Link
                          href={`/chapters/${firstPOV.chapter.slug}`}
                          className='text-gray-700 hover:text-gray-900 transition-colors'
                        >
                          {firstPOV.chapter.title}
                        </Link>
                      </div>
                    );
                  }

                  if (lastPOV && lastPOV !== firstPOV) {
                    items.push(
                      <div key='last-pov' className='flex'>
                        <span className='font-medium text-gray-600 w-20'>son pov:</span>
                        <Link
                          href={`/chapters/${lastPOV.chapter.slug}`}
                          className='text-gray-700 hover:text-gray-900 transition-colors'
                        >
                          {lastPOV.chapter.title}
                        </Link>
                      </div>
                    );
                  }

                  return items;
                })()}
              </div>
            </div>
          )}

          {/* Character Stats */}
          <div className='pt-3 border-t border-gray-300'>
            <div className='text-xs text-gray-500 space-y-1'>
              <p>{formatDistanceToNow(new Date(character.createdAt))} əvvəl yaradıldı</p>
              {character.updatedAt !== character.createdAt && (
                <p>{formatDistanceToNow(new Date(character.updatedAt))} əvvəl yeniləndi</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
