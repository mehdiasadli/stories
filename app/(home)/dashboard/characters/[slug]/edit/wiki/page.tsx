import { getCharacter } from '@/lib/fetchers';
import DashboardCharactersEditWikiForm from './form';
import { notFound } from 'next/navigation';

interface DashboardCharactersEditWikiPageProps {
  params: Promise<{ slug: string }>;
}

export default async function DashboardCharactersEditWikiPage({ params }: DashboardCharactersEditWikiPageProps) {
  const { slug } = await params;
  const character = await getCharacter(slug);

  if (!character) {
    notFound();
  }

  return (
    <div className='min-h-screen bg-white'>
      <div className='max-w-full mx-auto'>
        <DashboardCharactersEditWikiForm character={character} />
      </div>
    </div>
  );
}
