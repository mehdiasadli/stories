import { redirect } from 'next/navigation';

interface DashboardChapterPageProps {
  params: Promise<{ slug: string }>;
}

export default async function DashboardChapterPage({ params }: DashboardChapterPageProps) {
  const { slug } = await params;
  redirect(`/chapters/${slug}`);
}
