// Simple in-memory cache for analytics data
// In production, this should be replaced with Redis or similar

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class AnalyticsCache {
  private static cache = new Map<string, CacheEntry<any>>();
  
  // Cache TTL in milliseconds
  private static readonly TTL = {
    visitorStats: 5 * 60 * 1000, // 5 minutes
    productStats: 10 * 60 * 1000, // 10 minutes
    dailyStats: 60 * 60 * 1000, // 1 hour
  };

  /**
   * Get cached data if it exists and is not expired
   */
  static get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      // Entry expired, remove it
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Set cached data with TTL
   */
  static set<T>(key: string, data: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.TTL.visitorStats
    };

    this.cache.set(key, entry);
  }

  /**
   * Get visitor statistics from cache
   */
  static getVisitorStats(): any | null {
    return this.get('visitor_stats');
  }

  /**
   * Set visitor statistics in cache
   */
  static setVisitorStats(stats: any): void {
    this.set('visitor_stats', stats, this.TTL.visitorStats);
  }

  /**
   * Get product statistics from cache
   */
  static getProductStats(): any | null {
    return this.get('product_stats');
  }

  /**
   * Set product statistics in cache
   */
  static setProductStats(stats: any): void {
    this.set('product_stats', stats, this.TTL.productStats);
  }

  /**
   * Clear all cached data
   */
  static clear(): void {
    this.cache.clear();
  }

  /**
   * Clear expired entries
   */
  static cleanup(): void {
    const now = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   */
  static getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Cleanup expired entries every 10 minutes
setInterval(() => {
  AnalyticsCache.cleanup();
}, 10 * 60 * 1000);

export default AnalyticsCache;