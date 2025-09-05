'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Edit, FileEdit, Trash2, Users } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ChapterActionsProps {
  chapterSlug: string;
  authorId: string;
}

export function ChapterActions({ chapterSlug, authorId }: ChapterActionsProps) {
  const { data: session, status } = useSession();

  // Don't render anything while loading or if user is not authenticated
  if (status === 'loading') {
    return null;
  }

  if (!session?.user?.id) {
    return null;
  }

  // Only show actions if the current user is the author
  if (session.user.id !== authorId) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className='cursor-pointer text-gray-600 hover:text-gray-900 transition-colors border-b border-gray-200 hover:border-gray-400 pb-1 inline-flex items-center gap-1'>
          actions
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='center' className='w-48'>
        <DropdownMenuItem asChild>
          <Link href={`/dashboard/chapters/${chapterSlug}/edit`} className='flex items-center gap-2 w-full'>
            <Edit className='w-4 h-4' />
            edit chapter
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href={`/dashboard/chapters/${chapterSlug}/edit/content`} className='flex items-center gap-2 w-full'>
            <FileEdit className='w-4 h-4' />
            edit content
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href={`/dashboard/chapters/${chapterSlug}/edit/characters`} className='flex items-center gap-2 w-full'>
            <Users className='w-4 h-4' />
            edit characters
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link
            href={`/dashboard/chapters/${chapterSlug}/delete`}
            className='flex items-center gap-2 w-full text-red-600 hover:text-red-700'
          >
            <Trash2 className='w-4 h-4' />
            delete chapter
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
