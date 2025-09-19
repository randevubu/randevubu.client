import { useState, useEffect } from 'react';

interface SMSCountdownState {
  remainingSeconds: number;
  isRateLimited: boolean;
  formatTime: () => string;
}

/**
 * Hook for managing SMS rate limiting countdown timer
 */
export function useSMSCountdown(initialSeconds: number = 0): SMSCountdownState & {
  startCountdown: (seconds: number) => void;
  reset: () => void;
} {
  const [remainingSeconds, setRemainingSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (remainingSeconds <= 0) return;

    const timer = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [remainingSeconds]);

  const startCountdown = (seconds: number) => {
    setRemainingSeconds(seconds);
  };

  const reset = () => {
    setRemainingSeconds(0);
  };

  const formatTime = () => {
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return {
    remainingSeconds,
    isRateLimited: remainingSeconds > 0,
    formatTime,
    startCountdown,
    reset
  };
}

export default useSMSCountdown;