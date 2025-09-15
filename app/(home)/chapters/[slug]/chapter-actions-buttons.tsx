'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';
import { BookOpen, Heart } from 'lucide-react';

interface ChapterActionsButtonsProps {
  chapterSlug: string;
}

export function ChapterActionsButtons({ chapterSlug }: ChapterActionsButtonsProps) {
  const { data: session, status } = useSession();
  const [isRead, setIsRead] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [hasRead, setHasRead] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);

  // Check initial status when component mounts
  useEffect(() => {
    if (status === 'loading') return;

    if (!session?.user?.id) {
      setIsCheckingStatus(false);
      return;
    }

    const checkStatus = async () => {
      try {
        const [readResponse, favoriteResponse] = await Promise.all([
          fetch(`/api/chapters/${chapterSlug}/read`),
          fetch(`/api/chapters/${chapterSlug}/favorite`),
        ]);

        if (readResponse.ok) {
          const readData = await readResponse.json();
          setIsRead(readData.isRead);
          setHasRead(readData.isRead);
        }

        if (favoriteResponse.ok) {
          const favoriteData = await favoriteResponse.json();
          setIsFavorited(favoriteData.isFavorited);
          setHasRead(favoriteData.hasRead);
        }
      } catch (error) {
      } finally {
        setIsCheckingStatus(false);
      }
    };

    checkStatus();
  }, [session, chapterSlug, status]);

  const handleMarkAsRead = async () => {
    if (!session?.user?.id) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/chapters/${chapterSlug}/read`, {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setIsRead(true);
        setHasRead(true);
        if (!data.alreadyRead) {
          toast.success('bölüm oxundu!');
        }
      } else {
        toast.error(data.error || 'bölüm oxundu bilmədi');
      }
    } catch (error) {
      toast.error('xəta baş verdi. yenidən cəhd edin.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFavorite = async () => {
    if (!session?.user?.id) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/chapters/${chapterSlug}/favorite`, {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setIsFavorited(true);
        if (!data.alreadyFavorited) {
          toast.success('bölüm favoritlərə əlavə edildi!');
        }
      } else {
        if (data.mustReadFirst) {
          toast.error('bölüm favorit edilmədən öncə oxunmalıdır');
        } else {
          toast.error(data.error || 'bölüm favorit edilə bilmədi');
        }
      }
    } catch (error) {
      toast.error('xəta baş verdi. yenidən cəhd edin.');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (status === 'loading' || isCheckingStatus) {
    return (
      <div className='mt-8 pt-6 border-t border-gray-200'>
        <div className='flex items-center justify-center gap-4'>
          <div className='animate-pulse bg-gray-200 h-10 w-32 rounded'></div>
          <div className='animate-pulse bg-gray-200 h-10 w-32 rounded'></div>
        </div>
      </div>
    );
  }

  // Show login prompt for non-authenticated users
  if (!session?.user?.id) {
    return (
      <div className='mt-8 pt-6 border-t border-gray-200'>
        <div className='text-center'>
          <p className='text-sm text-gray-600 mb-4'>bölüm oxuma və favorit etmək üçün daxil olun</p>
          <Link
            href={`/auth/login?chapterRef=${chapterSlug}`}
            className='inline-flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors border border-gray-200 hover:border-gray-400 bg-white hover:bg-gray-50'
          >
            daxil ol
          </Link>
        </div>
      </div>
    );
  }

  // Show action buttons for authenticated users
  return (
    <div className='mt-8 pt-6 border-t border-gray-200'>
      <div className='flex items-center justify-center gap-4'>
        <button
          onClick={handleMarkAsRead}
          disabled={isRead || isLoading}
          className={`
            inline-flex items-center gap-2 px-4 py-2 text-sm border transition-colors duration-200
            ${
              isRead
                ? 'bg-green-50 text-green-700 border-green-200 cursor-not-allowed'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-400'
            }
            ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <BookOpen className='w-4 h-4' />
          {isRead ? 'oxundu' : 'oxundu olaraq işarələ'}
        </button>

        <button
          onClick={handleFavorite}
          disabled={!hasRead || isFavorited || isLoading}
          className={`
            inline-flex items-center gap-2 px-4 py-2 text-sm border transition-colors duration-200
            ${
              isFavorited
                ? 'bg-red-50 text-red-700 border-red-200 cursor-not-allowed'
                : !hasRead
                  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-400'
            }
            ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          title={!hasRead ? 'favorit etmədən öncə oxu' : ''}
        >
          {isFavorited ? <Heart className='w-4 h-4' fill='red' stroke='red' /> : <Heart className='w-4 h-4' />}
          {isFavorited ? 'favorit' : 'favoritlə'}
        </button>
      </div>
    </div>
  );
}
