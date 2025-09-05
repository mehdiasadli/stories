import { auth } from '@/lib/auth';
import { getChapter } from '@/lib/fetchers';
import { notFound, redirect } from 'next/navigation';

interface ChapterActionsPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ChapterActionsPage({ params }: ChapterActionsPageProps) {
  const { slug } = await params;

  const chapter = await getChapter(slug);
  const session = await auth();

  if (!chapter) {
    notFound();
  }

  if (!session?.user?.id || chapter.authorId !== session.user.id) {
    redirect(`/chapters/${chapter.slug}`);
  }

  return <div>Page</div>;
}
