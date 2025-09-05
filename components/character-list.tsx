import { CharacterSearchSchema, TCharacterSearch } from '@/lib/schemas/character.schema';
import Link from 'next/link';
import { SearchBar } from './search-bar';
import { CharacterCard } from './character-card';
import { Pagination } from './pagination';
import { getCharacters } from '@/lib/fetchers';
import { Suspense } from 'react';

interface CharacterListProps {
  searchParams: Promise<Partial<TCharacterSearch>>;
  dashboard?: boolean;
}

export default async function CharacterList({ searchParams, dashboard }: CharacterListProps) {
  const resolvedSearchParams = await searchParams;

  const { data } = CharacterSearchSchema.safeParse(resolvedSearchParams);
  const parsedParams = data ?? CharacterSearchSchema.parse({});

  const { characters, pagination } = await getCharacters(parsedParams, dashboard);

  return (
    <div>
      {dashboard && (
        <div className='flex flex-col gap-4'>
          <div className='mx-auto'>
            <div className='flex items-center justify-center gap-4'>
              <Link href='/dashboard/characters/create' className='mb-4 underline text-gray-500'>
                Create Character
              </Link>
              <Link href='/dashboard/chapters' className='mb-4 underline text-gray-500'>
                Go to chapters
              </Link>
            </div>
          </div>
          <div className='mx-auto w-full'>
            <Suspense>
              <SearchBar dashboard characters />
            </Suspense>
          </div>
        </div>
      )}

      {!dashboard && (
        <Suspense>
          <SearchBar characters />
        </Suspense>
      )}

      {characters.length === 0 && (
        <div className='max-w-2xl mx-auto'>
          <p className='text-center text-gray-500'>No characters found</p>
        </div>
      )}

      <div className='max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4'>
        {characters.map((character) => (
          <CharacterCard character={character} key={character.id} />
        ))}
      </div>

      <Suspense>
        <Pagination dashboard={dashboard} characters pagination={pagination} />
      </Suspense>
    </div>
  );
}
