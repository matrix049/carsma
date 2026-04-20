import express from 'express';
import { trackPageView, getAnalyticsStats } from '../controllers/analyticsController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

/**
 * Public endpoint for tracking page views
 * POST /api/analytics/track
 * 
 * Body: {
 *   pageType: string,
 *   productId?: string,
 *   sessionId: string
 * }
 */
router.post('/track', trackPageView);

/**
 * Protected endpoint for retrieving analytics statistics
 * GET /api/analytics/stats
 * 
 * Requires: Admin authentication
 * 
 * Response: {
 *   success: boolean,
 *   data: {
 *     visitorStats: {
 *       totalVisits: number,
 *       last24Hours: number,
 *       last7Days: number
 *     },
 *     productStats: Array<{
 *       productId: string,
 *       productName: string,
 *       productImage: string,
 *       productCategory?: string,
 *       viewCount: number,
 *       percentage: number
 *     }>
 *   }
 * }
 */
router.get('/stats', authenticateToken, getAnalyticsStats);

export default router;