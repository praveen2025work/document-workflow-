import { useEffect, useRef, useCallback } from 'react';

interface UseAutoRefreshOptions {
  onRefresh: () => void | Promise<void>;
  interval?: number; // in milliseconds, default 30 seconds
  enabled?: boolean; // default true
}

export const useAutoRefresh = ({ 
  onRefresh, 
  interval = 30000, // 30 seconds default
  enabled = true 
}: UseAutoRefreshOptions) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onRefreshRef = useRef(onRefresh);

  // Update the ref when onRefresh changes
  useEffect(() => {
    onRefreshRef.current = onRefresh;
  }, [onRefresh]);

  const startAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    if (enabled && interval > 0) {
      intervalRef.current = setInterval(() => {
        onRefreshRef.current();
      }, interval);
    }
  }, [interval, enabled]);

  const stopAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const restartAutoRefresh = useCallback(() => {
    stopAutoRefresh();
    startAutoRefresh();
  }, [stopAutoRefresh, startAutoRefresh]);

  // Start auto-refresh when enabled
  useEffect(() => {
    if (enabled) {
      startAutoRefresh();
    } else {
      stopAutoRefresh();
    }

    return () => {
      stopAutoRefresh();
    };
  }, [enabled, startAutoRefresh, stopAutoRefresh]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAutoRefresh();
    };
  }, [stopAutoRefresh]);

  return {
    startAutoRefresh,
    stopAutoRefresh,
    restartAutoRefresh
  };
};