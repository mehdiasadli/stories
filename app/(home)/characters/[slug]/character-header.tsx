import Link from 'next/link';
import { CharacterActionsButton } from './character-actions-button';

export function CharacterHeader({ name, slug }: { name: string; slug: string }) {
  return (
    <div className='text-center mb-8'>
      <Link href={`/characters`} className='text-sm text-gray-500 hover:text-gray-700 transition-colors'>
        ← personajlar
      </Link>

      <h1 className='text-6xl font-serif text-gray-900 mt-8 mb-2'>{name}</h1>

      <CharacterActionsButton characterSlug={slug} />
    </div>
  );
}
