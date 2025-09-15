'use client';

import Editor from '@/components/tiptap/editor';
import { TChapter } from '@/lib/schemas/chapter.schema';
import { getWordCount } from '@/lib/utils';
import Link from 'next/link';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

interface DashboardChapterEditContentFormProps {
  chapter: TChapter;
}

export default function DashboardChapterEditContentForm({ chapter }: DashboardChapterEditContentFormProps) {
  const [content, setContent] = useState(chapter.content);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getContentWordCount = useCallback(() => {
    return getWordCount(content, true);
  }, [content]);

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/chapters/${chapter.slug}/edit/content`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update chapter content');
      }

      toast.success('Chapter content updated successfully');
    } catch (error) {
      toast.error('An unexpected error occurred');
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
            href={`/chapters/${chapter.slug}`}
            className='text-sm text-gray-600 hover:text-gray-900 transition-colors'
          >
            ← {chapter.title}
          </Link>
        </div>

        <div className='flex items-center gap-4'>
          <div className='text-sm text-gray-500'>{getContentWordCount().toLocaleString()} words</div>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className='text-sm text-gray-600 hover:text-gray-900 transition-colors border border-gray-200 hover:border-gray-400 px-4 py-2 bg-white hover:bg-gray-50'
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
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
        />
      </div>
    </div>
  );
}
