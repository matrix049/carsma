import { Request, Response } from 'express';
import PageView from '../models/PageView';
import Product from '../models/Product';
import mongoose from 'mongoose';
import AnalyticsCache from '../services/analyticsCache';

// Valid page types enum
const VALID_PAGE_TYPES = ['home', 'shop', 'product', 'contact', 'faq', 'cart', 'checkout', 'customize'] as const;
type PageType = typeof VALID_PAGE_TYPES[number];

// Interface for tracking request
interface TrackPageViewRequest {
  pageType: string;
  productId?: string;
  sessionId: string;
}

// Interface for visitor statistics
interface VisitorStats {
  totalVisits: number;
  last24Hours: number;
  last7Days: number;
}

// Interface for product statistics
interface ProductStats {
  productId: string;
  productName: string;
  productImage: string;
  productCategory?: string;
  viewCount: number;
  percentage: number;
}

// Interface for analytics response
interface AnalyticsStatsResponse {
  visitorStats: VisitorStats;
  productStats: ProductStats[];
}

/**
 * Track a page view
 * POST /api/analytics/track
 */
export const trackPageView = async (req: Request, res: Response): Promise<void> => {
  try {
    const { pageType, productId, sessionId }: TrackPageViewRequest = req.body;

    // Validate required fields
    if (!pageType || !sessionId) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: pageType and sessionId are required'
      });
      return;
    }

    // Validate pageType enum
    if (!VALID_PAGE_TYPES.includes(pageType as any)) {
      res.status(400).json({
        success: false,
        message: `Invalid pageType. Must be one of: ${VALID_PAGE_TYPES.join(', ')}`
      });
      return;
    }

    // Validate productId if provided
    if (productId && !mongoose.Types.ObjectId.isValid(productId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid productId format'
      });
      return;
    }

    // Validate sessionId length
    if (sessionId.length > 100) {
      res.status(400).json({
        success: false,
        message: 'SessionId too long (max 100 characters)'
      });
      return;
    }

    // Create page view record. The validation above guarantees pageType is in
    // VALID_PAGE_TYPES, so the cast to the narrowed union is sound.
    const pageViewData = {
      pageType: pageType as PageType,
      productId: productId ? new mongoose.Types.ObjectId(productId) : undefined,
      sessionId,
      userAgent: req.get('User-Agent')?.substring(0, 500), // Truncate to max length
      ipAddress: req.ip || req.connection.remoteAddress
    };

    await PageView.create(pageViewData);

    res.json({
      success: true,
      message: 'Page view tracked successfully'
    });
  } catch (error) {
    console.error('Page view tracking error:', error);
    
    // Don't fail the request - analytics should be non-blocking
    res.json({
      success: false,
      message: 'Tracking failed but request processed'
    });
  }
};

/**
 * Get visitor statistics
 */
const getVisitorStatistics = async (): Promise<VisitorStats> => {
  // Check cache first
  const cached = AnalyticsCache.getVisitorStats();
  if (cached) {
    return cached;
  }

  const now = new Date();
  const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [totalVisits, visits24h, visits7d] = await Promise.all([
    PageView.countDocuments(),
    PageView.countDocuments({ timestamp: { $gte: last24Hours } }),
    PageView.countDocuments({ timestamp: { $gte: last7Days } })
  ]);

  const stats = {
    totalVisits,
    last24Hours: visits24h,
    last7Days: visits7d
  };

  // Cache the results
  AnalyticsCache.setVisitorStats(stats);

  return stats;
};

/**
 * Get product statistics
 */
const getProductStatistics = async (): Promise<ProductStats[]> => {
  // Check cache first
  const cached = AnalyticsCache.getProductStats();
  if (cached) {
    return cached;
  }

  const productStats = await PageView.aggregate([
    // Match only product page views with valid product IDs
    { 
      $match: { 
        pageType: 'product', 
        productId: { $exists: true, $ne: null } 
      } 
    },
    
    // Group by product and count views
    { 
      $group: { 
        _id: '$productId', 
        viewCount: { $sum: 1 } 
      } 
    },
    
    // Sort by view count (descending)
    { $sort: { viewCount: -1 } },
    
    // Limit to top 10
    { $limit: 10 },
    
    // Join with product collection
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product',
        pipeline: [
          { $project: { name: 1, image: 1, category: 1 } }
        ]
      }
    },
    
    // Unwind product data
    { $unwind: { path: '$product', preserveNullAndEmptyArrays: false } },
    
    // Project final structure
    {
      $project: {
        productId: { $toString: '$_id' },
        productName: '$product.name',
        productImage: '$product.image',
        productCategory: '$product.category',
        viewCount: 1,
        _id: 0
      }
    }
  ]);

  // Calculate total views for percentage calculation
  const totalViews = productStats.reduce((sum, product) => sum + product.viewCount, 0);

  // Add percentage to each product
  const stats = productStats.map(product => ({
    ...product,
    percentage: totalViews > 0 ? Math.round((product.viewCount / totalViews) * 100 * 10) / 10 : 0
  }));

  // Cache the results
  AnalyticsCache.setProductStats(stats);

  return stats;
};

/**
 * Get analytics statistics
 * GET /api/analytics/stats
 */
export const getAnalyticsStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const [visitorStats, productStats] = await Promise.all([
      getVisitorStatistics(),
      getProductStatistics()
    ]);

    const response: AnalyticsStatsResponse = {
      visitorStats,
      productStats
    };

    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Analytics stats error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve analytics data',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
};