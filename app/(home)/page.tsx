import { TChapterSearch } from '@/lib/schemas/chapter.schema';
import { ChapterList } from '@/components/chapter-list';

interface HomeProps {
  searchParams: Promise<Partial<TChapterSearch>>;
}

export default async function Home({ searchParams }: HomeProps) {
  return <ChapterList searchParams={searchParams} />;
}
