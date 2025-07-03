import { useEffect, useState, useCallback } from "react";

/**
 * Custom hook that debounces a function call
 * @param callback The function to debounce
 * @param delay The delay in milliseconds
 * @returns A debounced version of the callback
 */
export const useDebounce = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  const [timer, setTimer] = useState<NodeJS.Timeout>();

  // Clean up the timer on unmount
  useEffect(() => {
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [timer]);

  // Return a memoized debounced version of the callback
  return useCallback(
    (...args: Parameters<T>) => {
      if (timer) {
        clearTimeout(timer);
      }
      setTimer(setTimeout(() => callback(...args), delay));
    },
    [callback, delay, timer]
  );
};
