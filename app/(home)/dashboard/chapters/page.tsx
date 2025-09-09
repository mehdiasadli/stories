import { getAllChapters } from '@/lib/fetchers';
import { DashboardChaptersTable } from './table';

export default async function DashboardChaptersPage() {
  const chapters = await getAllChapters(false);

  return <DashboardChaptersTable chapters={chapters} />;
}
