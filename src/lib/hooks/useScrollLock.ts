import { useEffect } from 'react';

/**
 * Custom hook to lock/unlock body scroll
 * Replaces direct document.body manipulation in useEffect
 *
 * @param locked - Whether scroll should be locked
 *
 * @example
 * const [isModalOpen, setIsModalOpen] = useState(false);
 * useScrollLock(isModalOpen);
 */
export function useScrollLock(locked: boolean = false): void {
  useEffect(() => {
    if (!locked) return;

    // Store original values
    const originalOverflow = document.body.style.overflow;
    const originalPosition = document.body.style.position;
    const originalWidth = document.body.style.width;
    const originalHeight = document.body.style.height;

    // Lock scroll
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';

    // Cleanup - restore original values
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.position = originalPosition;
      document.body.style.width = originalWidth;
      document.body.style.height = originalHeight;
    };
  }, [locked]);
}
