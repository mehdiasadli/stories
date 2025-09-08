import './character-content.css';
import { Chapter, Character, CharacterAppearanceType } from '@prisma/client';

interface CharacterArticleProps {
  character: Character & {
    chapters: {
      chapter: Pick<Chapter, 'id' | 'slug' | 'title' | 'order' | 'publishedAt'>;
      appearanceType: CharacterAppearanceType;
      note?: string | null;
      quotesAndThoughts?: string[];
    }[];
  };
}
export function CharacterArticle({ character }: CharacterArticleProps) {
  return (
    <>
      {character.description && (
        <div className='mb-8'>
          <blockquote className='border-l-4 border-gray-300 pl-6 italic text-gray-700 text-lg leading-relaxed'>
            {character.description}
          </blockquote>
        </div>
      )}

      {/* Wiki Article */}
      <div className='prose prose-lg max-w-none'>
        <div
          className='chapter-content'
          dangerouslySetInnerHTML={{ __html: character.wiki || '<p>personaj haqqında wiki kontenti yoxdur.</p>' }}
        />
      </div>
    </>
  );
}
