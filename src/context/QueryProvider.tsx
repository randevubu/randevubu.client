'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { isAxiosError } from '../lib/utils/errorExtractor';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

// Make queryClient available globally for cache utilities
declare global {
  interface Window {
    queryClient: QueryClient;
  }
}

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () => {
      const client = new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000, // 30 seconds - much shorter for development
            gcTime: 2 * 60 * 1000, // 2 minutes - shorter cache time
            refetchOnWindowFocus: true, // Allow refetch on window focus
            refetchOnMount: true, // Allow refetch on mount for fresh data
            refetchOnReconnect: true, // Still refetch on reconnect
            retry: (failureCount, error: unknown) => {
              const axiosError = isAxiosError(error);
              if (axiosError && (error.response?.status === 404 || error.response?.status === 401)) {
                return false;
              }
              return failureCount < 2;
            },
          },
          mutations: {
            retry: (failureCount, error: unknown) => {
              const axiosError = isAxiosError(error);
              if (axiosError && error.response?.status >= 400 && error.response?.status < 500) {
                return false;
              }
              return failureCount < 1;
            },
          },
        },
      });
      
      // Make queryClient available globally for cache utilities
      if (typeof window !== 'undefined') {
        window.queryClient = client;
      }
      
      return client;
    }
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}