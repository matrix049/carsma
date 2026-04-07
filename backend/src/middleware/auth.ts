import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

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
 * @returns Decoded token payload with admin id and email
 * @throws Error if token is invalid, expired, or missing
 */
export function verifyToken(token: string): { id: string; email: string } {
  try {
    const secret = process.env.JWT_SECRET;
    
    if (!secret) {
      throw new Error('JWT_SECRET is not configured');
    }

    const decoded = jwt.verify(token, secret) as { id: string; email: string };
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
 * Validates JWT token from Authorization header and attaches admin info to request
 */
export function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
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
    const admin = verifyToken(token);
    
    // Attach admin info to request object
    req.admin = admin;
    
    next();
  } catch (error: any) {
    res.status(401).json({
      error: true,
      message: error.message || 'Authentication failed'
    });
  }
}
