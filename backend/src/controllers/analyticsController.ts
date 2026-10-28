import { Request, Response } from 'express';
import PageView from '../models/PageView';
import AnalyticsCache from '../services/analyticsCache';
import { getOverview, RANGES, RangeKey } from '../services/overviewStats';

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
/**
 * Everything the admin dashboard shows for one period
 * GET /api/analytics/overview?range=today|7d|30d|90d[&fresh=1]
 */
export const getOverviewStats = async (req: Request, res: Response): Promise<void> => {
  const range = typeof req.query.range === 'string' && Object.prototype.hasOwnProperty.call(RANGES, req.query.range) ? (req.query.range as RangeKey) : '7d';
  try {
    const data = await getOverview(range, req.query.fresh === '1');
    res.json({ success: true, data });
  } catch (error) {
    console.error('Overview stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to load the dashboard numbers' });
  }
};
