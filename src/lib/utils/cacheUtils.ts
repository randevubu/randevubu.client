'use client';

/**
 * Cache utility functions for development and production
 */

/**
 * Clear all caches (Service Worker + React Query)
 */
export async function clearAllCaches() {
  if (typeof window === 'undefined') return;

  // Clear Service Worker caches
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    );
    console.log('🧹 Cleared all Service Worker caches');
  }

  // Clear React Query cache
  if (window.queryClient) {
    window.queryClient.clear();
    console.log('🧹 Cleared React Query cache');
  }

  // Force reload to ensure fresh data
  window.location.reload();
}

/**
 * Clear specific cache by name
 */
export async function clearCacheByName(cacheName: string) {
  if (typeof window === 'undefined') return;

  if ('caches' in window) {
    const deleted = await caches.delete(cacheName);
    console.log(`🧹 Cleared cache: ${cacheName}`, deleted);
  }
}

/**
 * Clear API cache specifically
 */
export async function clearApiCache() {
  await clearCacheByName('randevubu-api-v1');
}

/**
 * Clear static asset cache
 */
export async function clearStaticCache() {
  await clearCacheByName('randevubu-v1');
}

/**
 * Development helper: Add cache clearing to window object
 */
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).clearAllCaches = clearAllCaches;
  (window as any).clearApiCache = clearApiCache;
  (window as any).clearStaticCache = clearStaticCache;
  (window as any).clearCacheByName = clearCacheByName;
}

/**
 * Force refresh all queries
 */
export function refreshAllQueries() {
  if (typeof window !== 'undefined' && window.queryClient) {
    window.queryClient.invalidateQueries();
    console.log('🔄 Refreshed all React Query data');
  }
}

/**
 * Force refresh specific query
 */
export function refreshQuery(queryKey: string[]) {
  if (typeof window !== 'undefined' && window.queryClient) {
    window.queryClient.invalidateQueries({ queryKey });
    console.log('🔄 Refreshed query:', queryKey);
  }
}

// Development helpers
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).refreshAllQueries = refreshAllQueries;
  (window as any).refreshQuery = refreshQuery;
}
