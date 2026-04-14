import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import Product from '../models/Product';

const router = Router();

// Health check endpoint
router.get('/health', async (req: Request, res: Response) => {
  try {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: {
        connected: mongoose.connection.readyState === 1,
        state: getConnectionState(mongoose.connection.readyState),
      },
      mongodb: {
        hasUri: !!process.env.MONGODB_URI,
        uriPrefix: process.env.MONGODB_URI?.substring(0, 20) + '...',
      }
    };

    // Try to count products
    try {
      const productCount = await Product.countDocuments();
      health.database = {
        ...health.database,
        productCount,
        canQuery: true
      };
    } catch (dbError: any) {
      health.database = {
        ...health.database,
        canQuery: false,
        error: dbError.message
      };
    }

    const statusCode = health.database.connected ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

function getConnectionState(state: number): string {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  return states[state as keyof typeof states] || 'unknown';
}

export default router;
