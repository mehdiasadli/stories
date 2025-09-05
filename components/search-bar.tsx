'use client';

import { useDebounce } from '@/lib/hooks';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { TChapterDateRange, TChapterStatusFilter } from '@/lib/schemas/chapter.schema';

export function SearchBar({ dashboard, characters }: { dashboard?: boolean; characters?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState('');
  const [order, setOrder] = useState('newest');
  const [dateRange, setDateRange] = useState<TChapterDateRange>('all-time');
  const [statusFilter, setStatusFilter] = useState<TChapterStatusFilter[]>([]);
  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    const page = searchParams.get('page') || '1';
    const params = new URLSearchParams();

    // Force dateRange to 'all-time' for rising order
    const effectiveDateRange = order === 'rising' ? 'all-time' : dateRange;

    if (!characters) {
      params.set('order', order);
      params.set('dateRange', effectiveDateRange);
    }
    params.set('page', page);

    if (debouncedSearch) {
      params.set('q', debouncedSearch);
    }

    if (dashboard && statusFilter.length > 0) {
      statusFilter.forEach((status) => params.append('status', status));
    }

    router.push(
      `${dashboard ? `/dashboard/${characters ? 'characters' : 'chapters'}` : characters ? '/characters' : '/'}?${params.toString()}`
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, order, dateRange, statusFilter]);

  const handleStatusChange = (status: TChapterStatusFilter, checked: boolean) => {
    setStatusFilter((prev) => (checked ? [...prev, status] : prev.filter((s) => s !== status)));
  };

  return (
    <div className='max-w-4xl mx-auto'>
      <div className='mb-6 space-y-4'>
        {/* Search and main filters */}
        <div className='flex gap-4 items-center justify-center flex-wrap'>
          <input
            type='text'
            placeholder={characters ? 'personaj axtar...' : 'bölüm axtar...'}
            className='flex-1 min-w-[200px] px-4 py-3 text-sm border border-gray-200 rounded-none focus:outline-none focus:border-gray-400 bg-white'
            name='search'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {!characters && (
            <select
              className='px-4 py-3 text-sm border border-gray-200 rounded-none focus:outline-none focus:border-gray-400 bg-white'
              value={order}
              onChange={(e) => setOrder(e.target.value)}
            >
              <option value='newest'>ən son</option>
              <option value='oldest'>ilk</option>
              <option value='alphabetical-asc'>A-Z</option>
              <option value='alphabetical-desc'>Z-A</option>
              <option value='most-comments'>ən çox şərh</option>
              <option value='most-read'>ən çox oxunan</option>
              <option value='most-favorited'>ən çox favoritlənən</option>
              <option value='longest'>ən uzun</option>
              <option value='shortest'>ən qısa</option>
              <option value='popular'>ən populyar</option>
              <option value='rising'>yüksəlişdə olan</option>
            </select>
          )}

          {!characters && (
            <select
              className={`px-4 py-3 text-sm border border-gray-200 rounded-none focus:outline-none focus:border-gray-400 ${
                order === 'rising' ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white'
              }`}
              value={order === 'rising' ? 'all-time' : dateRange}
              onChange={(e) => setDateRange(e.target.value as TChapterDateRange)}
              disabled={order === 'rising'}
              title={order === 'rising' ? 'Date range is automatically handled for Rising order' : ''}
            >
              <option value='all-time'>bütün</option>
              <option value='today'>bugün</option>
              <option value='this-week'>bu həftə</option>
              <option value='this-month'>bu ay</option>
              <option value='this-year'>bu il</option>
            </select>
          )}
        </div>

        {/* Status filter for dashboard only */}
        {dashboard &&
          (!characters ? (
            <div className='flex items-center justify-center gap-4'>
              <span className='text-sm font-medium text-gray-700'>Status:</span>
              {(['DRAFT', 'PUBLISHED', 'ARCHIVED'] as TChapterStatusFilter[]).map((status) => (
                <label key={status} className='flex items-center gap-2 text-sm'>
                  <input
                    type='checkbox'
                    checked={statusFilter.includes(status)}
                    onChange={(e) => handleStatusChange(status, e.target.checked)}
                    className='rounded border-gray-300'
                  />
                  <span className='capitalize'>{status.toLowerCase()}</span>
                </label>
              ))}
            </div>
          ) : null)}
      </div>
    </div>
  );
}
