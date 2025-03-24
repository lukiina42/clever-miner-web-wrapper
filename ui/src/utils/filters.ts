import { Dispatch, SetStateAction } from 'react';

/**
 * Generic interface for filter states
 */
export interface FilterState {
  name?: string;
  ordering?: string;
  [key: string]: string | undefined;
}

/**
 * Handles ordering changes for a field
 * @param field The field to order by
 * @param setFilters The function to update filters
 */
export function handleOrderingChange<T extends FilterState>(
  field: string,
  setFilters: Dispatch<SetStateAction<T>>
) {
  setFilters((prev) => {
    // Check if we're already ordering by this field
    if (prev.ordering === field) {
      // Toggle between ascending and descending
      return { ...prev, ordering: `-${field}` } as T;
    } else if (prev.ordering === `-${field}`) {
      // If already descending, clear the ordering
      return { ...prev, ordering: undefined } as T;
    } else {
      // Set new ordering field
      return { ...prev, ordering: field } as T;
    }
  });
}

/**
 * Creates a debounced function
 * @param func The function to debounce
 * @param wait The wait time in milliseconds
 * @returns A debounced version of the function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function (...args: Parameters<T>): void {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Synchronizes filter state with URL search parameters
 * @param searchParams Current URL search parameters
 * @param setFilters Function to update filter state
 */
export function syncFiltersFromURL<T extends FilterState>(
  searchParams: URLSearchParams,
  setFilters: Dispatch<SetStateAction<T>>
) {
  const newFilters: Record<string, string> = {};

  searchParams.forEach((value, key) => {
    if (value) {
      newFilters[key] = value;
    }
  });

  if (Object.keys(newFilters).length > 0) {
    setFilters((prev) => ({ ...prev, ...newFilters }) as T);
  }
}

/**
 * Updates URL search parameters based on filter state
 * @param filters Current filter state
 * @param setSearchParams Function to update URL search parameters
 */
export function updateURLFromFilters(
  filters: FilterState,
  setSearchParams: (params: Record<string, string>) => void
) {
  const params: Record<string, string> = {};

  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      params[key] = value;
    }
  });

  setSearchParams(params);
}
