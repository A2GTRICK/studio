'use client';

import { useState, useEffect, useCallback } from 'react';

type UsageData = {
  date: string;
  count: number;
  limit: number;
};

/**
 * A custom hook to manage and enforce daily usage limits for features,
 * persisting the data in localStorage.
 *
 * @param featureKey A unique key for the feature being tracked (e.g., 'aiNotesGenerations').
 * @param defaultLimit The default daily limit for the feature.
 * @param hasPremiumAccess A boolean to bypass the limit.
 * @returns An object with the current count, limit, and functions to interact with the usage data.
 */
export function useUsageLimiter(featureKey: string, defaultLimit: number, hasPremiumAccess = false) {
  const [count, setCount] = useState(0);
  const [limit, setLimit] = useState(defaultLimit);

  // Load usage data from localStorage on initial render
  useEffect(() => {
    // If user has premium, no need to track limits.
    if (hasPremiumAccess) {
        setCount(0);
        setLimit(Infinity);
        return;
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      const storedData = localStorage.getItem(featureKey);

      if (storedData) {
        const usageData: UsageData = JSON.parse(storedData);
        if (usageData.date === today) {
          setCount(usageData.count);
          setLimit(usageData.limit);
        } else {
          // It's a new day, reset the usage.
          localStorage.setItem(
            featureKey,
            JSON.stringify({ date: today, count: 0, limit: defaultLimit })
          );
          setCount(0);
          setLimit(defaultLimit);
        }
      } else {
         // No data exists, initialize for today.
         localStorage.setItem(
            featureKey,
            JSON.stringify({ date: today, count: 0, limit: defaultLimit })
          );
      }
    } catch (error) {
      console.warn(`Could not access localStorage for ${featureKey}. Usage tracking will be session-based.`);
    }
  }, [featureKey, defaultLimit, hasPremiumAccess]);

  /**
   * Updates the usage data in both state and localStorage.
   */
  const updateUsage = useCallback((newCount: number, newLimit?: number) => {
    const today = new Date().toISOString().split('T')[0];
    const finalLimit = newLimit ?? limit;
    setCount(newCount);
    if (newLimit !== undefined) {
      setLimit(finalLimit);
    }
    try {
        localStorage.setItem(featureKey, JSON.stringify({ date: today, count: newCount, limit: finalLimit }));
    } catch (error) {
        console.warn(`Could not persist usage data for ${featureKey} to localStorage.`);
    }
  }, [featureKey, limit]);


  /**
   * Increments the usage count by a specified amount (default is 1).
   */
  const increment = useCallback((amount = 1) => {
    if (hasPremiumAccess) return;
    const newCount = count + amount;
    if (newCount <= limit) {
        updateUsage(newCount);
    }
  }, [count, limit, updateUsage, hasPremiumAccess]);
  
  /**
   * Resets the daily usage count and optionally sets a new limit for the day.
   * Useful for when a user purchases more usage.
   */
  const reset = useCallback((newLimit?: number) => {
      updateUsage(0, newLimit ?? defaultLimit);
  }, [updateUsage, defaultLimit]);
  
  /**
   * Updates just the limit for the current day.
   */
  const updateLimit = useCallback((newLimit: number) => {
      updateUsage(count, newLimit);
  }, [count, updateUsage]);


  /**
   * A boolean indicating if the user can still use the feature.
   */
  const canUse = hasPremiumAccess || count < limit;

  return { count, limit, increment, reset, canUse, updateLimit };
}
