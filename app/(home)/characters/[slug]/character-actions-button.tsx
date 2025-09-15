'use client';

import { Heart } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface CharacterActionsButtonProps {
  characterSlug: string;
}

export function CharacterActionsButton({ characterSlug }: CharacterActionsButtonProps) {
  const { data: session, status } = useSession();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session?.user?.id) {
      setIsCheckingStatus(false);
      return;
    }

    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/characters/${characterSlug}/favorite`);

        if (response.ok) {
          const data = await response.json();
          setIsFavorited(data.isFavorited);
        }
      } catch (error) {
        toast.error('Xəta baş verdi. Yenidən cəhd edin.');
      } finally {
        setIsCheckingStatus(false);
      }
    };

    checkStatus();
  }, [session, characterSlug, status]);

  const handleFavorite = async () => {
    if (!session?.user?.id) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/characters/${characterSlug}/favorite`, {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setIsFavorited(true);
        if (!data.alreadyFavorited) {
          toast.success('personaj favoritlərə əlavə edildi!');
        }
      } else {
        toast.error(data.error || 'personaj favoritlərə əlavə edilə bilmədi');
      }
    } catch (error) {
      toast.error('Xəta baş verdi. Yenidən cəhd edin.');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading' || isCheckingStatus) {
    return (
      <div className='mt-8 pt-6 border-t border-gray-200'>
        <div className='flex items-center justify-center gap-4'>
          <div className='animate-pulse bg-gray-200 h-10 w-32 rounded'></div>
        </div>
      </div>
    );
  }

  if (!session?.user?.id) {
    return (
      <div className='mt-8 pt-6 border-t border-gray-200'>
        <div className='text-center'>
          <p className='text-sm text-gray-600 mb-4'>
            personaj haqqında məlumatları oxumaq və favoritlərə əlavə etmək üçün daxil olun
          </p>
          <Link
            href={`/auth/login?characterRef=${characterSlug}`}
            className='inline-flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors border border-gray-200 hover:border-gray-400 bg-white hover:bg-gray-50'
          >
            daxil ol
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className='mt-8 pt-6 border-t border-gray-200'>
      <div className='flex items-center justify-center gap-4'>
        <button
          onClick={handleFavorite}
          disabled={isFavorited || isLoading}
          className={`
            inline-flex items-center gap-2 px-4 py-2 text-sm border transition-colors duration-200
            ${
              isFavorited
                ? 'bg-red-50 text-red-700 border-red-200 cursor-not-allowed'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-400'
            }
            ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {isFavorited ? <Heart className='w-4 h-4' fill='red' stroke='red' /> : <Heart className='w-4 h-4' />}
          {isFavorited ? 'favorit' : 'favoritlə'}
        </button>
      </div>
    </div>
  );
}
