'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Edit, FileEdit, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CharacterActionsProps {
  characterSlug: string;
  authorId: string;
}

export function CharacterActions({ characterSlug, authorId }: CharacterActionsProps) {
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
          <Link href={`/dashboard/characters/${characterSlug}/edit`} className='flex items-center gap-2 w-full'>
            <Edit className='w-4 h-4' />
            edit character
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href={`/dashboard/characters/${characterSlug}/edit/wiki`} className='flex items-center gap-2 w-full'>
            <FileEdit className='w-4 h-4' />
            edit wiki
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link
            href={`/dashboard/characters/${characterSlug}/delete`}
            className='flex items-center gap-2 w-full text-red-600 hover:text-red-700'
          >
            <Trash2 className='w-4 h-4' />
            delete character
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
