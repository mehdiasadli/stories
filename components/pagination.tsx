'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { TPagination } from '@/lib/types';

interface PaginationProps {
  pagination: TPagination;
  dashboard?: boolean;
  userSlug?: string;
  resource?: string;
  characters?: boolean;
}

export function Pagination({ pagination, dashboard, characters, userSlug, resource }: PaginationProps) {
  const searchParams = useSearchParams();

  const getPageUrl = (page: number) => {
    const params = new URLSearchParams();

    // Preserve all current search parameters
    params.set('page', page.toString());

    if (!userSlug) {
      if (!characters) {
        params.set('order', searchParams.get('order') ?? 'newest');
        params.set('dateRange', searchParams.get('dateRange') ?? 'all-time');
      }

      if (searchParams.get('q')) {
        params.set('q', searchParams.get('q')!);
      }
    }

    // Handle multiple status values
    const statusValues = searchParams.getAll('status');
    statusValues.forEach((status) => params.append('status', status));

    if (characters) {
      return `${dashboard ? '/dashboard/characters' : '/characters'}?${params.toString()}`;
    }

    return `${dashboard ? '/dashboard/chapters' : userSlug ? `/users/${userSlug}/${resource}` : '/'}?${params.toString()}`;
  };

  if (pagination.totalPages <= 1) return null;

  const currentPage = pagination.page;
  const totalPages = pagination.totalPages;

  // Smart pagination: show relevant page numbers with ellipsis
  const getVisiblePages = () => {
    const delta = 2; // Number of pages to show on each side of current page
    const range = [];
    const rangeWithDots = [];

    // Always show first page
    range.push(1);

    // Add pages around current page
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    // Always show last page (if more than 1 page)
    if (totalPages > 1) {
      range.push(totalPages);
    }

    // Remove duplicates and sort
    const uniqueRange = [...new Set(range)].sort((a, b) => a - b);

    // Add ellipsis where there are gaps
    for (let i = 0; i < uniqueRange.length; i++) {
      if (i > 0 && uniqueRange[i] - uniqueRange[i - 1] > 1) {
        rangeWithDots.push('...');
      }
      rangeWithDots.push(uniqueRange[i]);
    }

    return rangeWithDots;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className='mt-12 mb-8'>
      <div className='flex items-center justify-center gap-1'>
        {visiblePages.map((page, index) => {
          if (page === '...') {
            return (
              <span key={`ellipsis-${index}`} className='px-3 py-2 text-sm text-gray-400 select-none'>
                ...
              </span>
            );
          }

          const pageNumber = page as number;
          const isCurrentPage = pageNumber === currentPage;

          return (
            <Link
              key={pageNumber}
              href={getPageUrl(pageNumber)}
              className={`
                px-3 py-2 text-sm border transition-colors duration-200
                ${
                  isCurrentPage
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-400'
                }
              `}
            >
              {pageNumber}
            </Link>
          );
        })}
      </div>

      {/* Page info */}
      <div className='text-center mt-4'>
        <p className='text-xs text-gray-500'>
          {currentPage} / {totalPages} • ümumi {pagination.total}{' '}
          {characters ? 'personaj' : resource === 'comments' ? 'şərh' : 'bölüm'}
        </p>
      </div>
    </div>
  );
}
