'use client';

import { useDebounce } from '@/lib/hooks';
import { SearchQuerySchema } from '@/lib/schemas/common.schema';
import { cn } from '@/lib/utils';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useState } from 'react';
import z from 'zod';

interface SearchProps extends Omit<React.ComponentProps<'input'>, 'className' | 'value' | 'onChange'> {
  placeholder: string;
  schema?: z.ZodString | z.ZodOptional<z.ZodString>;
  name?: string;
  inputClassName?: string;
  containerClassName?: string;
  searchParamKey?: string;
  debounceMs?: number;
  clearable?: boolean;
}

export default function Search({
  schema = SearchQuerySchema,
  placeholder,
  name = 'search',
  inputClassName = '',
  containerClassName = '',
  searchParamKey = 'q',
  debounceMs = 500,
  clearable = true,
  ...props
}: SearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Track if component is mounted to avoid hydration issues
  const [isMounted, setIsMounted] = useState(false);
  const [search, setSearch] = useState('');

  const debouncedSearch = useDebounce(search, debounceMs);

  // Handle mounting and initial sync from URL
  useEffect(() => {
    setIsMounted(true);

    // Initialize from URL params after mounting
    const urlQuery = searchParams.get(searchParamKey);
    if (urlQuery) {
      try {
        const validatedQuery = schema.parse(urlQuery);
        if (validatedQuery) {
          setSearch(validatedQuery);
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {}
    }
  }, [searchParams, searchParamKey, schema]);

  // Update URL params when debounced search changes (only after mount)
  const updateSearchParams = useCallback(
    (searchValue: string) => {
      if (!isMounted) return;

      const params = new URLSearchParams(searchParams.toString());

      if (searchValue.trim()) {
        try {
          // Validate the search value before updating URL
          const validatedValue = schema.parse(searchValue);
          if (validatedValue) {
            params.set(searchParamKey, validatedValue);
          } else {
            params.delete(searchParamKey);
          }
        } catch (error) {
          console.error(error);
          // If validation fails, remove the param
          params.delete(searchParamKey);
        }
      } else {
        params.delete(searchParamKey);
      }

      const newUrl = `${pathname}${params.toString() ? `?${params.toString()}` : ''}`;
      router.replace(newUrl, { scroll: false });
    },
    [isMounted, searchParams, pathname, router, schema, searchParamKey]
  );

  // Update URL when debounced search changes
  useEffect(() => {
    if (!isMounted) return;
    updateSearchParams(debouncedSearch);
  }, [debouncedSearch, updateSearchParams, isMounted]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
  };

  const handleClear = () => {
    setSearch('');
  };

  const initialClassNames = {
    container: 'relative max-w-4xl mx-auto mb-4',
    input:
      'flex-1 min-w-[200px] w-full px-4 py-3 text-sm border border-gray-200 rounded-none focus:outline-none focus:border-gray-400 bg-white',
  };

  // Don't render until mounted to avoid hydration mismatch
  if (!isMounted) {
    return (
      <div className={cn(initialClassNames.container, containerClassName)}>
        <input
          type='text'
          placeholder={placeholder}
          className={cn(initialClassNames.input, inputClassName)}
          value=''
          onChange={() => {}}
          name={name}
          {...props}
        />
      </div>
    );
  }

  return (
    <Suspense fallback={<div className={cn(initialClassNames.container, containerClassName)}></div>}>
      <div className={cn(initialClassNames.container, containerClassName)}>
        {/* hidden label for accessibility */}
        <label htmlFor={name} className='sr-only'>
          {placeholder}
        </label>
        <input
          type='text'
          placeholder={placeholder}
          className={cn(initialClassNames.input, inputClassName)}
          value={search}
          onChange={handleInputChange}
          name={name}
          {...props}
        />
        {search && clearable && (
          <button
            type='button'
            onClick={handleClear}
            className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none'
            aria-label='Clear search'
          >
            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
            </svg>
          </button>
        )}
      </div>
    </Suspense>
  );
}
