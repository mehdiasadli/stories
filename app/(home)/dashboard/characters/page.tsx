import { getAllCharacters } from '@/lib/fetchers';
import { DashboardCharactersTable } from './table';

export default async function DashboardCharactersPage() {
  const characters = await getAllCharacters('all');

  return <DashboardCharactersTable characters={characters} />;
}
