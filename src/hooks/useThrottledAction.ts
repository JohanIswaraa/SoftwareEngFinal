import { useRef, useCallback } from 'react';

interface ThrottleOptions {
  delay: number; // milliseconds
}

/**
 * Hook to throttle actions per unique identifier
 * Prevents duplicate actions within the specified delay period
 */
export const useThrottledAction = ({ delay }: ThrottleOptions) => {
  const lastActionTime = useRef<Map<string, number>>(new Map());

  const throttle = useCallback((id: string, action: () => void): boolean => {
    const now = Date.now();
    const lastTime = lastActionTime.current.get(id);

    if (lastTime && now - lastTime < delay) {
      // Action is throttled
      return false;
    }

    // Execute action
    lastActionTime.current.set(id, now);
    action();
    return true;
  }, [delay]);

  return { throttle };
};
