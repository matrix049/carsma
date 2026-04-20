// Analytics service for tracking page views and user interactions

// Valid page types
export type PageType = 'home' | 'shop' | 'product' | 'contact' | 'faq' | 'cart' | 'checkout' | 'customize';

// Interface for tracking data
export interface TrackingData {
  pageType: PageType;
  productId?: string;
  sessionId: string;
}

// Interface for visitor statistics
export interface VisitorStats {
  totalVisits: number;
  last24Hours: number;
  last7Days: number;
}

// Interface for product statistics
export interface ProductStats {
  productId: string;
  productName: string;
  productImage: string;
  productCategory?: string;
  viewCount: number;
  percentage: number;
}

// Interface for analytics data response
export interface AnalyticsData {
  visitorStats: VisitorStats;
  productStats: ProductStats[];
}

class AnalyticsService {
  private static readonly SESSION_KEY = 'analytics_session_id';
  private static readonly API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? 'https://carsma-production.up.railway.app/api' 
    : 'http://localhost:5000/api';

  /**
   * Generate a unique session ID
   */
  static generateSessionId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `${timestamp}-${random}`;
  }

  /**
   * Get or create session ID
   */
  static getSessionId(): string {
    if (typeof window === 'undefined') {
      // Server-side rendering - return temporary ID
      return this.generateSessionId();
    }

    let sessionId = localStorage.getItem(this.SESSION_KEY);
    if (!sessionId) {
      sessionId = this.generateSessionId();
      localStorage.setItem(this.SESSION_KEY, sessionId);
    }
    return sessionId;
  }

  /**
   * Track a page view
   */
  static async trackPageView(data: TrackingData): Promise<void> {
    try {
      // Don't track on server-side
      if (typeof window === 'undefined') {
        return;
      }

      const response = await fetch(`${this.API_BASE_URL}/analytics/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      // Don't throw errors for analytics failures - should be non-blocking
      if (!response.ok) {
        console.warn('Analytics tracking failed:', response.status, response.statusText);
      }
    } catch (error) {
      // Log error but don't throw - analytics should never break user experience
      console.warn('Analytics tracking error:', error);
    }
  }

  /**
   * Track product page view
   */
  static async trackProductView(productId: string): Promise<void> {
    await this.trackPageView({
      pageType: 'product',
      productId,
      sessionId: this.getSessionId()
    });
  }

  /**
   * Track general page view
   */
  static async trackGeneralPageView(pageType: PageType): Promise<void> {
    await this.trackPageView({
      pageType,
      sessionId: this.getSessionId()
    });
  }

  /**
   * Fetch analytics statistics (admin only)
   */
  static async fetchAnalyticsStats(token: string): Promise<AnalyticsData> {
    const response = await fetch(`${this.API_BASE_URL}/analytics/stats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch analytics: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch analytics data');
    }

    return result.data;
  }
}

export default AnalyticsService;