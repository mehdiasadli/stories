/* eslint-disable @typescript-eslint/no-explicit-any */
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import z from 'zod';

export function useDebounce<T = string>(value: T, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    window.addEventListener('resize', listener);
    return () => window.removeEventListener('resize', listener);
  }, [matches, query]);

  return matches;
}

type IsOptional<T> = T extends z.ZodOptional<any> ? true : false;
type InferOutput<T> = T extends z.ZodSchema<infer U> ? U : never;

interface UseQueryParamPropsRequired<Output> {
  schema: z.ZodSchema<Output, z.ZodTypeDef, string>;
  defaultValue: Output;
  autoSetDefault?: boolean;
  debounceMs?: number;
  replaceHistory?: boolean;
  serialize?: (value: Output) => string;
  deserialize?: (value: string) => Output;
  onError?: (error: z.ZodError, value: string) => void;
  onValueChange?: (value: Output, previousValue: Output) => void;
}
interface UseQueryParamPropsOptional<Output> {
  schema: z.ZodOptional<z.ZodSchema<Output, z.ZodTypeDef, string>>;
  defaultValue?: Output;
  autoSetDefault?: boolean;
  debounceMs?: number;
  replaceHistory?: boolean;
  serialize?: (value: Output) => string;
  deserialize?: (value: string) => Output;
  onError?: (error: z.ZodError, value: string) => void;
  onValueChange?: (value: Output | undefined, previousValue: Output | undefined) => void;
}

type UseQueryParamProps<T> =
  IsOptional<T> extends true ? UseQueryParamPropsOptional<InferOutput<T>> : UseQueryParamPropsRequired<InferOutput<T>>;

export function useQueryParam<T extends z.ZodSchema<any, any, string> | z.ZodOptional<z.ZodSchema<any, any, string>>>(
  name: string,
  props: UseQueryParamProps<T>
) {
  type Output = InferOutput<T>;
  type ActualOutput = IsOptional<T> extends true ? Output | undefined : Output;

  const {
    schema,
    defaultValue,
    autoSetDefault = false,
    debounceMs = 0,
    replaceHistory = true,
    serialize,
    deserialize,
    onError,
    onValueChange,
  } = props;

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const [pendingValue, setPendingValue] = useState<ActualOutput | null>(null);
  const debouncedPendingValue = useDebounce(pendingValue, debounceMs);

  const serializeValue = useCallback(
    (value: ActualOutput): string => {
      if (serialize) {
        return serialize(value as Output);
      }

      if (value === null || value === undefined) {
        return '';
      }

      if (typeof value === 'object') {
        return JSON.stringify(value);
      }

      return String(value);
    },
    [serialize]
  );

  const deserializeValue = useCallback(
    (value: string): ActualOutput => {
      if (deserialize) {
        return deserialize(value) as ActualOutput;
      }

      try {
        return JSON.parse(value) as ActualOutput;
      } catch {
        return value as ActualOutput;
      }
    },
    [deserialize]
  );

  const getCurrentValue = useCallback((): ActualOutput => {
    const urlValue = searchParams.get(name);

    if (urlValue === null || urlValue === '') {
      return defaultValue as ActualOutput;
    }

    try {
      const deserializedValue = deserializeValue(urlValue);
      const parsedValue = schema.safeParse(deserializedValue);

      if (parsedValue.success) {
        return parsedValue.data as ActualOutput;
      }

      if (onError) {
        onError(parsedValue.error, urlValue);
      }

      return defaultValue as ActualOutput;
    } catch (error) {
      console.warn(`Failed to parse query param "${name}":`, error);
      return defaultValue as ActualOutput;
    }
  }, [searchParams, name, schema, defaultValue, deserializeValue, onError]);

  const currentValue = useMemo(() => getCurrentValue(), [getCurrentValue]);

  const updateUrl = useCallback(
    (value: ActualOutput, options?: { replace?: boolean }) => {
      const params = new URLSearchParams(searchParams.toString());

      if (
        value === null ||
        value === undefined ||
        (typeof value === 'string' && value === '') ||
        (Array.isArray(value) && value.length === 0)
      ) {
        params.delete(name);
      } else {
        try {
          const validatedValue = schema.safeParse(value);

          if (validatedValue.success) {
            params.set(name, serializeValue(value));
          } else {
            if (onError) {
              onError(validatedValue.error, serializeValue(value));
            }

            return;
          }
        } catch (error) {
          console.warn(`Failed to serialize query param "${name}":`, error);
          return;
        }
      }

      const newUrl = `${pathname}${params.toString() ? `?${params.toString()}` : ''}`;
      const shouldReplace = options?.replace ?? replaceHistory;

      if (shouldReplace) {
        router.replace(newUrl, { scroll: false });
      } else {
        router.push(newUrl, { scroll: false });
      }
    },
    [searchParams, pathname, router, name, schema, serializeValue, replaceHistory, onError]
  );

  const setValue = useCallback(
    (value: ActualOutput, options?: { replace?: boolean; immediate?: boolean }) => {
      const previous = currentValue;

      if (options?.immediate || debounceMs === 0) {
        updateUrl(value, options);
        if (onValueChange) {
          onValueChange(value as Output, previous as Output);
        }
      } else {
        setPendingValue(value);
      }
    },
    [currentValue, updateUrl, debounceMs, onValueChange]
  );

  useEffect(() => {
    if (pendingValue !== null && debouncedPendingValue === pendingValue) {
      const previous = currentValue;
      updateUrl(pendingValue);
      if (onValueChange) {
        onValueChange(pendingValue as Output, previous as Output);
      }
      setPendingValue(null);
    }
  }, [debouncedPendingValue, pendingValue, currentValue, updateUrl, onValueChange]);

  useEffect(() => {
    if (autoSetDefault && defaultValue !== undefined) {
      const urlValue = searchParams.get(name);

      if (!urlValue || urlValue === '') {
        updateUrl(defaultValue as ActualOutput);
      }
    }
  }, [autoSetDefault, defaultValue, name, searchParams, updateUrl]);

  const remove = useCallback(
    (options?: { replace?: boolean }) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete(name);

      const newUrl = `${pathname}${params.toString() ? `?${params.toString()}` : ''}`;
      const shouldReplace = options?.replace ?? replaceHistory;

      if (shouldReplace) {
        router.replace(newUrl, { scroll: false });
      } else {
        router.push(newUrl, { scroll: false });
      }
    },
    [searchParams, pathname, router, name, replaceHistory]
  );

  const reset = useCallback(
    (options?: { replace?: boolean }) => {
      if (defaultValue !== undefined) {
        setValue(defaultValue as ActualOutput, options);
      } else {
        remove(options);
      }
    },
    [defaultValue, setValue, remove]
  );

  const isDefault = useMemo(() => {
    return currentValue === defaultValue;
  }, [currentValue, defaultValue]);

  const exists = useMemo(() => {
    return searchParams.has(name);
  }, [searchParams, name]);

  return {
    value: pendingValue !== null ? pendingValue : currentValue,
    setValue,
    remove,
    reset,
    isDefault,
    exists,
    isPending: pendingValue !== null,

    // Aliases for convenience
    get: () => (pendingValue !== null ? pendingValue : currentValue),
    set: setValue,
  } as const;
}
