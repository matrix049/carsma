import express from 'express';
import { getAnalyticsStats, getOverviewStats } from '../controllers/analyticsController';
import { trackPageView, trackEvent } from '../controllers/trackingController';
import { authenticateToken } from '../middleware/auth';
import { rateLimit } from '../middleware/rateLimit';

const router = express.Router();

// Beacons arrive as text/plain (see trackingController); JSON is parsed globally.
const beaconBody = express.text({ type: 'text/plain', limit: '2kb' });
const trackLimit = rateLimit({ windowMs: 60 * 1000, max: 120, message: 'Too many tracking calls' });

/**
 * Public: a storefront page was opened
 * POST /api/analytics/track  { pageType, productId?, sessionId, path?, device?, landing?, source? }
 */
router.post('/track', trackLimit, beaconBody, trackPageView);

/**
 * Public: a click or action on the storefront
 * POST /api/analytics/event  { type, sessionId, productId?, page?, device? }
 */
router.post('/event', trackLimit, beaconBody, trackEvent);

/**
 * Admin: everything the dashboard shows for one period
 * GET /api/analytics/overview?range=today|7d|30d|90d[&fresh=1]
 */
router.get('/overview', authenticateToken, getOverviewStats);

/**
 * Admin: legacy all-time visitor + product view counts
 * GET /api/analytics/stats
 */
router.get('/stats', authenticateToken, getAnalyticsStats);

export default router;
