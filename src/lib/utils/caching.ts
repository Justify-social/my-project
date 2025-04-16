/**
 * Caching Utilities
 *
 * This file contains utility functions for implementing client-side caching
 * to optimize performance and reduce server load.
 */

import { useState, useEffect } from 'react';

/**
 * Custom hook for caching data client-side
 * @param key The key to use for storing the data
 * @param fetcher The function to fetch the data
 * @param ttl Time to live in seconds (default: 5 minutes)
 */
export function useClientCache<T>(key: string, fetcher: () => Promise<T>, ttl: number = 300) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check if data exists in cache
        const cacheKey = `cache_${key}`;
        const ttlKey = `ttl_${key}`;
        const cachedData = localStorage.getItem(cacheKey);
        const cachedTtl = localStorage.getItem(ttlKey);

        // If we have cached data and it's not expired, use it
        if (cachedData && cachedTtl) {
          const expirationTime = parseInt(cachedTtl, 10);
          if (Date.now() < expirationTime) {
            setData(JSON.parse(cachedData));
            setLoading(false);
            return;
          }
        }

        // Otherwise fetch new data
        const freshData = await fetcher();

        // Cache the new data
        localStorage.setItem(cacheKey, JSON.stringify(freshData));
        localStorage.setItem(ttlKey, (Date.now() + ttl * 1000).toString());

        setData(freshData);
        setLoading(false);
      } catch (err: unknown) {
        // Create a standard Error object for consistency
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        setLoading(false);
      }
    };

    fetchData();
  }, [key, ttl, fetcher]);

  return { data, loading, error };
}

/**
 * Function to invalidate a cached item
 * @param key The key of the cached item to invalidate
 */
export function invalidateCache(key: string) {
  localStorage.removeItem(`cache_${key}`);
  localStorage.removeItem(`ttl_${key}`);
}

/**
 * Function to invalidate all cached items
 */
export function invalidateAllCache() {
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith('cache_') || key.startsWith('ttl_'))) {
      localStorage.removeItem(key);
    }
  }
}
