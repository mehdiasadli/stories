'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';

type NotificationItem = {
  id: string;
  content: string;
  read: boolean;
  createdAt: string | Date;
  link?: string | null;
  acceptLink?: string | null;
  rejectLink?: string | null;
};

interface NotificationsListProps {
  initialNotifications: NotificationItem[];
}

export function NotificationsList({ initialNotifications }: NotificationsListProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const containerRef = useRef<HTMLUListElement | null>(null);

  const unreadIds = useMemo(() => notifications.filter((n) => !n.read).map((n) => n.id), [notifications]);

  const refreshBell = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('notifications:refresh'));
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      refreshBell();
    } catch (_e) {}
  };

  const markAllAsRead = async () => {
    try {
      setIsMarkingAll(true);
      await fetch('/api/notifications/mark-all-read', { method: 'POST' });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      refreshBell();
    } catch (_e) {
    } finally {
      setIsMarkingAll(false);
    }
  };

  const joinedUnreadIds = useMemo(() => unreadIds.join(','), [unreadIds]);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('data-id');
            const read = entry.target.getAttribute('data-read') === 'true';
            if (id && !read) {
              markAsRead(id);
              entry.target.setAttribute('data-read', 'true');
            }
          }
        }
      },
      { root: null, rootMargin: '0px', threshold: 0.4 }
    );

    const items = containerRef.current.querySelectorAll('[data-notification-item="true"]');
    items.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [joinedUnreadIds]);

  const isExternal = (url?: string | null) => !!url && /^(http|https):\/\//.test(url);

  const formatUtc = (value: string | Date) => {
    const d = new Date(value);
    const yyyy = d.getUTCFullYear();
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(d.getUTCDate()).padStart(2, '0');
    const hh = String(d.getUTCHours()).padStart(2, '0');
    const mi = String(d.getUTCMinutes()).padStart(2, '0');
    const ss = String(d.getUTCSeconds()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss} UTC`;
  };

  return (
    <div>
      <div className='mb-4 flex items-center justify-between'>
        <div className='text-sm text-gray-600'>{notifications.filter((n) => !n.read).length} oxunmamış bildiriş</div>
        <button
          type='button'
          className='text-sm text-gray-600 hover:text-gray-900 border border-gray-200 px-3 py-1 disabled:opacity-50'
          onClick={markAllAsRead}
          disabled={isMarkingAll || notifications.every((n) => n.read)}
        >
          hamısını oxundu kimi işarələ
        </button>
      </div>

      <ul className='space-y-3' ref={containerRef}>
        {notifications.map((n) => (
          <li
            key={n.id}
            data-notification-item='true'
            data-id={n.id}
            data-read={n.read ? 'true' : 'false'}
            className='border border-gray-200 bg-white p-4'
          >
            <div className='flex items-start justify-between gap-4'>
              <div className='text-sm text-gray-800'>{n.content}</div>
              <span
                className={
                  'ml-2 inline-flex items-center rounded px-2 py-0.5 text-xs ' +
                  (n.read
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-yellow-50 text-yellow-700 border border-yellow-200')
                }
              >
                {n.read ? 'oxunub' : 'oxunmayıb'}
              </span>
            </div>

            {(n.link || n.acceptLink || n.rejectLink) && (
              <div className='mt-3 flex flex-wrap gap-2'>
                {n.link && (
                  <Link
                    href={n.link}
                    target={isExternal(n.link) ? '_blank' : undefined}
                    rel={isExternal(n.link) ? 'noreferrer' : undefined}
                    className='inline-flex items-center px-3 py-1 text-xs border border-gray-200 text-gray-700 hover:bg-gray-50'
                    onClick={() => {
                      if (!n.read) markAsRead(n.id);
                    }}
                  >
                    bax
                  </Link>
                )}

                {n.acceptLink && (
                  <Link
                    href={n.acceptLink}
                    target={isExternal(n.acceptLink) ? '_blank' : undefined}
                    rel={isExternal(n.acceptLink) ? 'noreferrer' : undefined}
                    className='inline-flex items-center px-3 py-1 text-xs border border-green-200 text-green-700 hover:bg-green-50'
                    onClick={() => {
                      if (!n.read) markAsRead(n.id);
                    }}
                  >
                    qəbul et
                  </Link>
                )}

                {n.rejectLink && (
                  <Link
                    href={n.rejectLink}
                    target={isExternal(n.rejectLink) ? '_blank' : undefined}
                    rel={isExternal(n.rejectLink) ? 'noreferrer' : undefined}
                    className='inline-flex items-center px-3 py-1 text-xs border border-red-200 text-red-700 hover:bg-red-50'
                    onClick={() => {
                      if (!n.read) markAsRead(n.id);
                    }}
                  >
                    rədd et
                  </Link>
                )}
              </div>
            )}

            <div className='mt-2 text-xs text-gray-500'>{formatUtc(n.createdAt)}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
