'use client';

import { useState, useEffect } from 'react';
import { detectUserCity } from '../utils/locationDetection';

export interface UseLocationDetectionResult {
  detectedCity: string;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  setCity: (city: string) => void; // Allow manual override
}

/**
 * Reusable hook for detecting user's city location
 * 
 * @param initialCity - Optional initial city. If provided, skips detection and uses this value.
 * @param autoDetect - Whether to automatically detect location. Defaults to true.
 * 
 * @returns Object with detectedCity, loading state, error state, and setCity function for manual override
 * 
 * @example
 * // Auto-detect location
 * const { detectedCity, isLoading, setCity } = useLocationDetection();
 * 
 * // Use specific city (skip detection)
 * const { detectedCity } = useLocationDetection('Istanbul', false);
 * 
 * // Auto-detect but allow manual override
 * const { detectedCity, setCity } = useLocationDetection();
 * // Later: setCity('Antalya');
 */
export function useLocationDetection(
  initialCity?: string,
  autoDetect: boolean = true
): UseLocationDetectionResult {
  const [detectedCity, setDetectedCity] = useState<string>(initialCity || 'Istanbul');
  const [isLoading, setIsLoading] = useState<boolean>(autoDetect && !initialCity);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Detect city on frontend if auto-detect is enabled and no initial city provided
  useEffect(() => {
    if (!autoDetect || initialCity) {
      // Skip detection if disabled or initial city provided
      setIsLoading(false);
      return;
    }

    // Detect city using IP geolocation
    let cancelled = false;
    setIsLoading(true);
    setIsError(false);
    setError(null);

    detectUserCity()
      .then((detected) => {
        if (!cancelled) {
          setDetectedCity(detected);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setDetectedCity('Istanbul'); // Fallback
          setIsError(true);
          setError(err instanceof Error ? err : new Error('Location detection failed'));
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [autoDetect, initialCity]);

  // Manual override function
  const setCity = (city: string) => {
    setDetectedCity(city);
    setIsError(false);
    setError(null);
  };

  return {
    detectedCity,
    isLoading,
    isError,
    error,
    setCity,
  };
}



