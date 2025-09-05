import { getChapter } from '@/lib/fetchers';
import DashboardChapterEditContentForm from './form';
import { notFound } from 'next/navigation';

interface DashboardChapterEditContentPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function DashboardChapterEditContentPage({ params }: DashboardChapterEditContentPageProps) {
  const { slug } = await params;
  const chapter = await getChapter(slug);

  if (!chapter) {
    notFound();
  }

  return (
    <div className='min-h-screen bg-white'>
      <div className='max-w-full mx-auto'>
        <DashboardChapterEditContentForm chapter={chapter} />
      </div>
    </div>
  );
}
