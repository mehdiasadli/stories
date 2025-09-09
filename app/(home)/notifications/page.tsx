import { auth } from '@/lib/auth';
import { getNotifications } from '@/lib/fetchers';
import { redirect } from 'next/navigation';
import { NotificationsList } from '@/components/notifications-list';

export default async function NotificationsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/auth/login');
  }

  const notifications = await getNotifications(session.user.id, 'all');

  return (
    <div>
      <div className='max-w-4xl mx-auto px-4'>
        <div className='mb-6'>
          <h1 className='text-2xl font-bold text-gray-900'>Bildirişlər</h1>
          <p className='text-sm text-gray-600'>{notifications.length} bildiriş</p>
        </div>

        {notifications.length === 0 ? (
          <div className='text-sm text-gray-600 border border-gray-200 bg-white p-6'>Hal-hazırda bildiriş yoxdur.</div>
        ) : (
          <NotificationsList initialNotifications={notifications as any} />
        )}
      </div>
    </div>
  );
}
