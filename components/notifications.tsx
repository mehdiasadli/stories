'use client';

import { useEffect, useState } from 'react';
import { Bell, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function Notifications() {
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
        console.error('Error fetching notifications count:', error);
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

  return (
    <div
      className='relative'
      onClick={() => {
        if (!isLoadingCount && notificationsCount > 0) {
          router.push('/notifications');
        }
      }}
    >
      <Bell className='size-5 text-gray-600 hover:text-gray-900 transition-colors' />
      {isLoadingCount ? (
        <Loader2 className='size-4 animate-spin absolute -top-1 -right-1 text-xs w-3 h-3 flex items-center justify-center' />
      ) : notificationsCount > 0 ? (
        <div className='absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-3 h-3 flex items-center justify-center'>
          {notificationsCount}
        </div>
      ) : null}
    </div>
  );
}
