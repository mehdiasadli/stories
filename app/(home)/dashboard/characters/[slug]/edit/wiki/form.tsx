'use client';

import { TCharacter } from '@/lib/schemas/character.schema';
import Editor from '@/components/tiptap/editor';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

interface DashboardCharactersEditWikiFormProps {
  character: TCharacter;
}

export default function DashboardCharactersEditWikiForm({ character }: DashboardCharactersEditWikiFormProps) {
  const [content, setContent] = useState(character.wiki || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/characters/${character.slug}/edit/wiki`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ wiki: content }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update character wiki');
      }

      toast.success('Character wiki updated successfully');
    } catch (error) {
      console.error('Error updating character wiki:', error);
      // Handle error (show toast, etc.)
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='h-screen flex flex-col'>
      {/* Minimal Header Bar */}
      <div className='flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white'>
        <div className='flex items-center gap-4'>
          <Link
            href={`/characters/${character.slug}`}
            className='text-sm text-gray-600 hover:text-gray-900 transition-colors'
          >
            ← {character.name}
          </Link>
        </div>

        <div className='flex items-center gap-4'>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className='text-sm text-gray-600 hover:text-gray-900 transition-colors border border-gray-200 hover:border-gray-400 px-4 py-2 bg-white hover:bg-gray-50'
          >
            {isSubmitting ? 'saving...' : 'save changes'}
          </button>
        </div>
      </div>

      {/* Full Height Editor */}
      <div className='flex-1 overflow-hidden'>
        <Editor
          content={content}
          onUpdate={({ editor }) => {
            setContent(editor.getHTML());
          }}
          linkBase={`${process.env.NEXT_PUBLIC_APP_URL}/characters/`}
        />
      </div>
    </div>
  );
}
