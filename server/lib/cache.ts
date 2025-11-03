import { LRUCache } from 'lru-cache';

const CACHE_TTL_MS = parseInt(process.env.CACHE_TTL_SEC || '300') * 1000; // 5 minutes default

interface CacheOptions {
  max: number;
  ttl: number;
}

const options: CacheOptions = {
  max: 500,
  ttl: CACHE_TTL_MS,
};

export const cache = new LRUCache<string, any>(options);

export function getCacheKey(baseUrl: string, queryParams: Record<string, any>): string {
  const params = new URLSearchParams();
  Object.entries(queryParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, String(value));
    }
  });
  const queryString = params.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

export function getCached(key: string): any | undefined {
  return cache.get(key);
}

export function setCached(key: string, value: any): void {
  cache.set(key, value);
}

export function getCacheTTL(): number {
  return Math.floor(CACHE_TTL_MS / 1000);
}
