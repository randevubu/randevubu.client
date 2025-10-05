import { useEffect, useState } from 'react';

/**
 * Custom hook to detect media query matches
 * Replaces useEffect-based window resize listeners
 *
 * @example
 * const isMobile = useMediaQuery('(max-width: 768px)');
 * const isTouch = useMediaQuery('(hover: none) and (pointer: coarse)');
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Check if window is available (SSR safety)
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);

    // Set initial value
    setMatches(mediaQuery.matches);

    // Create event listener
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    // Fallback for older browsers
    else {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, [query]);

  return matches;
}

/**
 * Convenience hook for mobile detection
 * Combines viewport width and touch capability
 */
export function useIsMobile(): boolean {
  const isSmallScreen = useMediaQuery('(max-width: 768px)');
  const isTouch = useMediaQuery('(hover: none) and (pointer: coarse)');

  return isSmallScreen || isTouch;
}
