import { TChapterSearch } from '@/lib/schemas/chapter.schema';
import { ChapterList } from '@/components/chapter-list';

interface DashboardChaptersPageProps {
  searchParams: Promise<Partial<TChapterSearch>>;
}

export default async function DashboardChaptersPage({ searchParams }: DashboardChaptersPageProps) {
  return <ChapterList searchParams={searchParams} dashboard />;
}
