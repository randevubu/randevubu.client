'use client';

import { useState } from 'react';
import { clearAllCaches, clearApiCache, clearStaticCache, refreshAllQueries } from '../../lib/utils/cacheUtils';

/**
 * Development Cache Control Panel
 * Only shows in development mode
 */
export function CacheControlPanel() {
  const [isOpen, setIsOpen] = useState(false);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const handleClearAllCaches = async () => {
    await clearAllCaches();
  };

  const handleClearApiCache = async () => {
    await clearApiCache();
  };

  const handleClearStaticCache = async () => {
    await clearStaticCache();
  };

  const handleRefreshQueries = () => {
    refreshAllQueries();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg transition-colors"
        title="Cache Control Panel"
      >
        🧹
      </button>

      {/* Control Panel */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-4 min-w-64">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
            Cache Control Panel
          </h3>
          
          <div className="space-y-2">
            <button
              onClick={handleClearAllCaches}
              className="w-full text-left px-3 py-2 text-sm bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-700 dark:text-red-200 rounded transition-colors"
            >
              🧹 Clear All Caches & Reload
            </button>
            
            <button
              onClick={handleClearApiCache}
              className="w-full text-left px-3 py-2 text-sm bg-orange-100 hover:bg-orange-200 dark:bg-orange-900 dark:hover:bg-orange-800 text-orange-700 dark:text-orange-200 rounded transition-colors"
            >
              🔌 Clear API Cache
            </button>
            
            <button
              onClick={handleClearStaticCache}
              className="w-full text-left px-3 py-2 text-sm bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-200 rounded transition-colors"
            >
              📁 Clear Static Cache
            </button>
            
            <button
              onClick={handleRefreshQueries}
              className="w-full text-left px-3 py-2 text-sm bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 text-green-700 dark:text-green-200 rounded transition-colors"
            >
              🔄 Refresh All Queries
            </button>
          </div>
          
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Development tools for cache management
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
