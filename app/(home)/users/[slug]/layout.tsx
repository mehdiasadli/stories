import { format } from 'date-fns';
import { notFound } from 'next/navigation';
import { UserNavigation } from './navigation';
import { getProfileUser } from '@/lib/fetchers';

interface UserLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export default async function UserLayout({ children, params }: UserLayoutProps) {
  const { slug } = await params;

  const profileUser = await getProfileUser(slug);

  if (!profileUser || !profileUser.isEmailVerified || !profileUser.hasAdminVerified) {
    notFound();
  }

  const navigationItems = [
    { href: `/users/${slug}`, label: 'Əsas səhifə' },
    { href: `/users/${slug}/reads`, label: 'Oxuduğu bölümlər' },
    { href: `/users/${slug}/favorites`, label: 'Favorit bölümlər' },
    { href: `/users/${slug}/comments`, label: 'Şərhlər' },
  ];

  return (
    <div className='min-h-screen bg-white'>
      {/* Header */}
      <div className='border-b border-gray-200 bg-white'>
        <div className='max-w-4xl mx-auto px-4 sm:px-6 py-8'>
          <div className='flex items-start justify-between'>
            <div>
              <h1 className='text-3xl font-serif text-gray-900 mb-2'>{profileUser.name}</h1>
              <div className='flex items-center gap-4 text-sm text-gray-600'>
                <span>@{profileUser.slug}</span>
                {profileUser.admin && (
                  <span className='px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs'>Yazar</span>
                )}
                <span>Qoşulma tarixi: {format(profileUser.createdAt, 'MMMM yyyy')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <UserNavigation navigationItems={navigationItems} />

      {/* Content */}
      <div className='max-w-4xl mx-auto px-4 sm:px-6 py-8'>{children}</div>
    </div>
  );
}
