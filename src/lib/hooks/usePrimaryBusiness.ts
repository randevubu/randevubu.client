'use client';

import { useMyBusiness } from './useMyBusiness';
import { Business } from '../../types/business';

export interface UsePrimaryBusinessResult {
  business: Business | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Custom hook to fetch the primary (first) business for the authenticated user
 * 
 * Features:
 * - Returns only the primary business (first one from the list)
 * - Handles loading and error states
 * - Provides refetch functionality
 * - Uses TanStack Query under the hood for caching and deduplication
 */
export function usePrimaryBusiness(): UsePrimaryBusinessResult {
  const { businesses, isLoading, isError, error, refetch } = useMyBusiness();

  // Get the primary business (first one)
  const business = businesses.length > 0 ? businesses[0] : null;

  return {
    business,
    isLoading,
    isError,
    error,
    refetch
  };
}
