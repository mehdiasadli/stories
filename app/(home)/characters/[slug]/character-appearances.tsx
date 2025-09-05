import { Chapter, Character, CharacterAppearanceType } from '@prisma/client';
import Link from 'next/link';

const appearanceTypeMap: Record<CharacterAppearanceType, string> = {
  [CharacterAppearanceType.POV]: 'pov',
  [CharacterAppearanceType.APPEARANCE]: 'iştirak',
  [CharacterAppearanceType.MENTION]: 'qeyd',
};

interface CharacterAppearancesProps {
  character: Character & {
    chapters: {
      chapter: Pick<Chapter, 'id' | 'slug' | 'title' | 'order' | 'publishedAt'>;
      appearanceType: CharacterAppearanceType;
      note?: string | null;
      quotesAndThoughts?: string[];
    }[];
  };
}
export function CharacterAppearances({ character }: CharacterAppearancesProps) {
  return (
    <div className='mb-8 mt-8'>
      <h2 className='text-2xl font-serif text-gray-900 mb-4'>bölüm iştirakları</h2>

      {/* Group appearances by type */}
      {(() => {
        const groupedAppearances = character.chapters.reduce(
          (acc, appearance) => {
            const type = appearance.appearanceType;
            if (!acc[type]) acc[type] = [];
            acc[type].push(appearance);
            return acc;
          },
          {} as Record<string, typeof character.chapters>
        );

        const appearanceOrder = ['POV', 'APPEARANCE', 'MENTION'];

        return appearanceOrder.map((type) => {
          const appearances = groupedAppearances[type];
          if (!appearances || appearances.length === 0) return null;

          return (
            <div key={type} className='mb-6'>
              <h3 className='text-sm font-medium text-gray-700 mb-3'>
                {appearances.length} {appearanceTypeMap[type as CharacterAppearanceType]}
              </h3>

              <div className='space-y-2'>
                {appearances.map((appearance, index) => (
                  <div key={index} className='border border-gray-200 p-3'>
                    <div className='mb-2'>
                      <Link
                        href={`/chapters/${appearance.chapter.slug}`}
                        className='text-sm font-medium text-gray-900 hover:text-gray-700 transition-colors'
                      >
                        {appearance.chapter.title}
                      </Link>
                    </div>

                    {appearance.note && (
                      <div className='mb-1'>
                        <p className='text-sm text-gray-600'>{appearance.note}</p>
                      </div>
                    )}

                    {appearance.quotesAndThoughts && appearance.quotesAndThoughts.length > 0 && (
                      <div>
                        <h4 className='text-xs font-medium text-gray-500 mb-1 tracking-wide'>sitatlar və fikirlər</h4>
                        <div className='space-y-2'>
                          {appearance.quotesAndThoughts.map((quote, quoteIndex) => (
                            <div key={quoteIndex} className='border-l-2 border-gray-200 pl-3'>
                              <p className='text-sm text-gray-600 italic'>&quot;{quote}&quot;</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        });
      })()}
    </div>
  );
}
