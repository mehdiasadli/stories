'use client';

import { useState } from 'react';
import { toast } from 'sonner';

interface CharacterShareOptionsProps {
  characterName: string;
  characterUrl: string;
}

export function CharacterShareOptions({ characterName, characterUrl }: CharacterShareOptionsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const shareOptions = [
    {
      value: 'copy-link',
      label: 'linki kopyala',
      action: () => copyToClipboard(characterUrl),
    },
    {
      value: 'facebook',
      label: 'facebook',
      action: () => shareOnFacebook(characterName, characterUrl),
    },
    {
      value: 'whatsapp',
      label: 'whatsapp',
      action: () => shareOnWhatsApp(characterName, characterUrl),
    },
    {
      value: 'telegram',
      label: 'telegram',
      action: () => shareOnTelegram(characterName, characterUrl),
    },
    {
      value: 'twitter',
      label: 'twitter',
      action: () => shareOnTwitter(characterName, characterUrl),
    },
  ];

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('link kopyalandı!');
    } catch (error) {
      toast.error('link kopyalana bilmədi');
    }
  };

  const shareOnFacebook = (title: string, url: string) => {
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const shareOnWhatsApp = (title: string, url: string) => {
    const text = `Check out character "${title}" from "mahmud"`;
    const shareUrl = `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`;
    window.open(shareUrl, '_blank');
  };

  const shareOnTelegram = (title: string, url: string) => {
    const text = `Check out character "${title}" from "mahmud"`;
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    window.open(shareUrl, '_blank');
  };

  const shareOnTwitter = (title: string, url: string) => {
    const text = `Check out character "${title}" from "mahmud"`;
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  return (
    <div className='relative'>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='cursor-pointer text-gray-600 hover:text-gray-900 transition-colors border-b border-gray-200 hover:border-gray-400 pb-1'
      >
        paylaş
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div className='fixed inset-0 z-10' onClick={() => setIsOpen(false)} />

          {/* Menu */}
          <div className='absolute left-0 bottom-full mb-2 w-32 bg-white border border-gray-200 shadow-sm z-20'>
            {shareOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  option.action();
                  setIsOpen(false);
                }}
                className='w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors'
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
