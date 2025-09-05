import CharacterList from '@/components/character-list';
import { TCharacterSearch } from '@/lib/schemas/character.schema';

interface DashboardCharactersPageProps {
  searchParams: Promise<Partial<TCharacterSearch>>;
}

export default function DashboardCharactersPage({ searchParams }: DashboardCharactersPageProps) {
  return (
    <div>
      <CharacterList searchParams={searchParams} dashboard />
    </div>
  );
}
