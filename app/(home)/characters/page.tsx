import { CharacterCard } from '@/components/character-card';
import { WikiSearchBar } from '@/components/wiki-searchbar';
import { getWikiCharacters } from '@/lib/fetchers';
import { Suspense } from 'react';

export default async function CharactersPage() {
  const wikiCharacters = await getWikiCharacters();

  return (
    <div>
      <div className='max-w-4xl mx-auto flex flex-col gap-6'>
        <Suspense>
          <WikiSearchBar />
        </Suspense>

        {wikiCharacters.latestUpdatedCharacters.length > 0 && (
          <div className='flex flex-col gap-4'>
            <h2 className='text-2xl font-bold'>Son yenilənmiş personajlar</h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {wikiCharacters.latestUpdatedCharacters.map((character) => (
                <CharacterCard character={character} key={character.id} />
              ))}
            </div>
          </div>
        )}
        {wikiCharacters.mostFavoritedCharacters.length > 0 && (
          <div className='flex flex-col gap-4'>
            <h2 className='text-2xl font-bold'>Ən çox favorit edilmiş personajlar</h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {wikiCharacters.mostFavoritedCharacters.map((character) => (
                <CharacterCard character={character} key={character.id} />
              ))}
            </div>
          </div>
        )}
        {wikiCharacters.mostViewedCharacters.length > 0 && (
          <div className='flex flex-col gap-4'>
            <h2 className='text-2xl font-bold'>Ən çox baxışı olan personajlar</h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {wikiCharacters.mostViewedCharacters.map((character) => (
                <CharacterCard character={character} key={character.id} />
              ))}
            </div>
          </div>
        )}
        {wikiCharacters.mostAppearedCharacters.length > 0 && (
          <div className='flex flex-col gap-4'>
            <h2 className='text-2xl font-bold'>Ən çox iştirak edən personajlar</h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {wikiCharacters.mostAppearedCharacters.map((character) => (
                <CharacterCard character={character} key={character.id} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
