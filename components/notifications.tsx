'use client';

import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export function Notifications() {
  const session = useSession();
  const [notificationsCount, setNotificationsCount] = useState<number>(0);
  const [isLoadingCount, setIsLoadingCount] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const fetchNotificationsCount = async () => {
      setIsLoadingCount(true);
      try {
        const response = await fetch('/api/notifications/count');
        const data = (await response.json()) as { success: boolean; data?: number };
        setNotificationsCount(data.data || 0);
      } catch (error) {
        toast.error('Error fetching notifications count');
        setNotificationsCount(0);
      } finally {
        setIsLoadingCount(false);
      }
    };

    fetchNotificationsCount();

    const handler = () => fetchNotificationsCount();
    window.addEventListener('notifications:refresh', handler);
    return () => window.removeEventListener('notifications:refresh', handler);
  }, []);

  if (session.status === 'loading' || !session.data?.user?.id) {
    return null;
  }

  return (
    <div
      className='relative'
      onClick={() => {
        if (!isLoadingCount) {
          router.push('/notifications');
        }
      }}
    >
      <Bell className='size-5 text-gray-600 hover:text-gray-900 transition-colors' />
      {notificationsCount > 0 && !isLoadingCount ? (
        <div className='absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-3 h-3 flex items-center justify-center'>
          {notificationsCount}
        </div>
      ) : null}
    </div>
  );
}
