'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useApiError } from '@/src/lib/hooks/useApiError';
import { useErrorTranslations, useCommonTranslations } from '@/src/lib/utils/translations';
import { LanguageSwitcher } from '@/src/components/ui/LanguageSwitcher';

// Example component showing how to integrate translations
export function ExampleTranslatedComponent() {
  const [loading, setLoading] = useState(false);

  // Translation hooks
  const t = useTranslations();
  const errorT = useErrorTranslations();
  const commonT = useCommonTranslations();

  // Error handling hook with automatic translation
  const { handleError, handleSuccess } = useApiError();

  // Example API call with error handling
  const handleApiCall = async () => {
    setLoading(true);
    try {
      // Simulate API call that might fail
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulate various error scenarios
          const scenarios = [
            () => resolve({ data: 'success' }),
            () => reject(new Error('Network error')),
            () => reject({ response: { status: 401, data: { code: 'auth.unauthorized' } } }),
            () => reject({ response: { status: 403, data: { message: 'Access denied' } } })
          ];

          const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
          randomScenario();
        }, 1000);
      });

      // Success case
      handleSuccess(commonT('success') + '!');
    } catch (error) {
      // Error will be automatically translated and displayed as toast
      handleError(error as any);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      {/* Language switcher */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Choose Language:
        </label>
        <LanguageSwitcher />
      </div>

      <div className="space-y-4">
        {/* Using translations from common namespace */}
        <h2 className="text-xl font-bold">
          {commonT('loading')} Example
        </h2>

        {/* Using error translations directly */}
        <div className="space-y-2 text-sm">
          <p><strong>Auth Error:</strong> {errorT('auth.unauthorized')}</p>
          <p><strong>Business Error:</strong> {errorT('business.notFound')}</p>
          <p><strong>System Error:</strong> {errorT('system.internalError')}</p>
        </div>

        {/* Interactive example */}
        <button
          onClick={handleApiCall}
          disabled={loading}
          className={`w-full py-2 px-4 rounded font-medium transition-colors $'{
            loading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {loading ? commonT('loading') : 'Test API Call'}
        </button>

        {/* Common action buttons */}
        <div className="flex gap-2">
          <button className="flex-1 py-1 px-2 text-sm bg-green-500 hover:bg-green-600 text-white rounded">
            {commonT('save')}
          </button>
          <button className="flex-1 py-1 px-2 text-sm bg-gray-500 hover:bg-gray-600 text-white rounded">
            {commonT('cancel')}
          </button>
          <button className="flex-1 py-1 px-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded">
            {commonT('delete')}
          </button>
        </div>

        {/* Instructions */}
        <div className="text-xs text-gray-600 dark:text-gray-400 mt-4">
          <p>This example demonstrates:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Language switching with URL updates</li>
            <li>Translation hooks usage</li>
            <li>Automatic error translation</li>
            <li>Toast notifications in user's language</li>
            <li>Server-side safe translations</li>
          </ul>
        </div>
      </div>
    </div>
  );
}