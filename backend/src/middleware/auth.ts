import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin';

// Extend Express Request type to include admin property
export interface AuthRequest extends Request {
  admin?: {
    id: string;
    email: string;
  };
}

/**
 * Verify JWT token and extract admin information
 * @param token - JWT token string
 * @returns Decoded token payload with admin id, email and issued-at time
 * @throws Error if token is invalid, expired, or missing
 */
export function verifyToken(token: string): { id: string; email: string; iat?: number } {
  try {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error('JWT_SECRET is not configured');
    }

    const decoded = jwt.verify(token, secret) as { id: string; email: string; iat?: number };
    return decoded;
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expired');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    }
    throw new Error('Authentication failed');
  }
}

/**
 * Middleware to protect routes requiring authentication
 * Validates JWT token from Authorization header and attaches admin info to request.
 *
 * A valid signature isn't enough: the admin must still exist (removing an
 * admin ends their sessions) and the token must be newer than the admin's
 * last password change.
 */
export async function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({
        error: true,
        message: 'Authorization header missing'
      });
      return;
    }

    // Check for Bearer token format
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      res.status(401).json({
        error: true,
        message: 'Invalid authorization format. Use: Bearer <token>'
      });
      return;
    }

    const token = parts[1];

    // Verify token and extract admin info
    const decoded = verifyToken(token);

    let account;
    try {
      account = await Admin.findById(decoded.id).select('email passwordChangedAt').lean();
    } catch (dbError: any) {
      // A malformed id is a bad token; anything else is the database, which
      // must not log the admin out.
      if (dbError?.name === 'CastError') throw new Error('Invalid token');
      res.status(503).json({ error: true, message: 'Service temporarily unavailable' });
      return;
    }
    const revoked =
      !account ||
      account.email !== decoded.email?.toLowerCase() ||
      (account.passwordChangedAt && (decoded.iat ?? 0) * 1000 < new Date(account.passwordChangedAt).getTime());

    if (revoked) {
      res.status(401).json({
        error: true,
        message: 'Session revoked'
      });
      return;
    }

    // Attach admin info to request object
    req.admin = { id: decoded.id, email: decoded.email };

    next();
  } catch (error: any) {
    res.status(401).json({
      error: true,
      message: error.message || 'Authentication failed'
    });
  }
}
