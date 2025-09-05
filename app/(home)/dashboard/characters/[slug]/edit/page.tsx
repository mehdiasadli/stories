import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import { EditCharacterForm } from './form';
import { getCharacter } from '@/lib/fetchers';

interface CharacterEditPageProps {
  params: Promise<{ slug: string }>;
}

export default async function DashboardCharactersEditPage({ params }: CharacterEditPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    notFound();
  }

  const { slug } = await params;
  const character = await getCharacter(slug);

  if (!character) {
    notFound();
  }

  return (
    <div className='min-h-screen bg-white'>
      <div className='max-w-4xl mx-auto px-4 py-8'>
        {/* Header */}
        <div className='text-center mb-12'>
          <Link
            href={`/characters/${character.slug}`}
            className='text-sm text-gray-500 hover:text-gray-700 transition-colors'
          >
            ← back to {character.name}
          </Link>

          <h1 className='text-6xl font-serif text-gray-900 mt-6 mb-4'>Edit Character</h1>

          <p className='text-sm text-gray-600 mb-8'>Update character information</p>
        </div>

        {/* Form */}
        <div className='max-w-2xl mx-auto'>
          <EditCharacterForm character={character} />
        </div>
      </div>
    </div>
  );
}
