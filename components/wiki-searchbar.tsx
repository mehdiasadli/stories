'use client';

import { useDebounce } from '@/lib/hooks';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

export function WikiSearchBar() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [results, setResults] = useState<
    Array<{
      slug: string;
      name: string;
      nameDescription: string | null;
      description: string | null;
      profileImageUrl: string | null;
    }>
  >([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const term = debouncedSearch.trim();

    if (!term) {
      setResults([]);
      setOpen(false);
      return () => controller.abort();
    }

    setLoading(true);
    fetch(`/api/characters/search?q=${encodeURIComponent(term)}`, {
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('axtarış nəticələri alınmadı');
        const data = await res.json();
        setResults(Array.isArray(data) ? data : []);
        setOpen(true);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setResults([]);
          setOpen(false);
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [debouncedSearch]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <div className='mx-auto w-full' ref={containerRef}>
      <div className='mb-6 space-y-4'>
        {/* Search and main filters */}
        <div className='flex gap-4 items-center justify-center flex-wrap relative'>
          <input
            type='text'
            placeholder='personaj axtar...'
            className='flex-1 min-w-[200px] px-4 py-3 text-sm border border-gray-200 rounded-none focus:outline-none focus:border-gray-400 bg-white'
            name='search'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => results.length > 0 && setOpen(true)}
          />

          {open && (
            <div className='absolute left-0 right-0 top-full mt-2 z-50 max-h-80 overflow-auto border border-gray-200 bg-white shadow-sm'>
              {loading && <div className='px-4 py-3 text-sm text-gray-500'>axtarılır…</div>}
              {!loading && results.length === 0 && debouncedSearch.trim() && (
                <div className='px-4 py-3 text-sm text-gray-500'>nəticə tapılmadı</div>
              )}
              {!loading &&
                results.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/characters/${c.slug}`}
                    onClick={() => setOpen(false)}
                    className='flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors'
                  >
                    {/* Avatar */}
                    <div className='h-10 w-10 flex-shrink-0 bg-gray-100 border border-gray-200 overflow-hidden'>
                      {c.profileImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.profileImageUrl} alt={c.name} className='h-full w-full object-cover' />
                      ) : null}
                    </div>
                    <div className='min-w-0'>
                      <div className='text-sm font-medium text-gray-900'>{c.name}</div>
                      {c.nameDescription ? (
                        <div className='text-xs text-gray-600 line-clamp-2'>{c.nameDescription}</div>
                      ) : c.description ? (
                        <div className='text-xs text-gray-600 line-clamp-2'>{c.description}</div>
                      ) : null}
                    </div>
                  </Link>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
