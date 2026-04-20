import { useState, useEffect, useCallback } from 'react';
import AnalyticsService, { AnalyticsData, VisitorStats, ProductStats } from '@/lib/analyticsService';
import { useAuth } from '@/contexts/AuthContext';

// Hook return interface
export interface UseAnalyticsReturn {
  data: AnalyticsData | null;
  visitorStats: VisitorStats | null;
  productStats: ProductStats[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for fetching and managing analytics data
 */
export function useAnalytics(): UseAnalyticsReturn {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const fetchAnalytics = useCallback(async () => {
    if (!token) {
      setError('Authentication required');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const analyticsData = await AnalyticsService.fetchAnalyticsStats(token);
      setData(analyticsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch analytics data';
      setError(errorMessage);
      console.error('Analytics fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // Fetch data on mount and when token changes
  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Refetch function for manual refresh
  const refetch = useCallback(async () => {
    await fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    data,
    visitorStats: data?.visitorStats || null,
    productStats: data?.productStats || [],
    isLoading,
    error,
    refetch
  };
}

/**
 * Hook for tracking page views (client-side only)
 */
export function usePageTracking() {
  const trackPageView = useCallback(async (pageType: string, productId?: string) => {
    try {
      if (productId) {
        await AnalyticsService.trackProductView(productId);
      } else {
        await AnalyticsService.trackGeneralPageView(pageType as any);
      }
    } catch (error) {
      // Analytics errors should not affect user experience
      console.warn('Page tracking failed:', error);
    }
  }, []);

  return { trackPageView };
}