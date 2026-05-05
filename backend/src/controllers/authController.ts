import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin';

/**
 * Admin login controller
 * POST /api/admin/login
 * Validates credentials and returns JWT token
 */
export async function adminLogin(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      res.status(400).json({
        error: true,
        message: 'Email and password are required'
      });
      return;
    }

    // Find admin by email
    const admin = await Admin.findOne({ email });

    if (!admin) {
      res.status(401).json({
        error: true,
        message: 'Invalid credentials'
      });
      return;
    }

    // Compare password with hashed password
    const isPasswordValid = await admin.comparePassword(password);

    if (!isPasswordValid) {
      res.status(401).json({
        error: true,
        message: 'Invalid credentials'
      });
      return;
    }

    // Generate JWT token
    const secret = process.env.JWT_SECRET;
    
    if (!secret) {
      res.status(500).json({
        error: true,
        message: 'Server configuration error'
      });
      return;
    }

    // Admin session lifetime — kept long so the dashboard isn't constantly
     // logging the operator out. Override per-deploy via ADMIN_TOKEN_TTL
     // (any value `jsonwebtoken` accepts: e.g. '7d', '12h', '30d').
    const tokenTtl = process.env.ADMIN_TOKEN_TTL || '7d';

    const token = jwt.sign(
      { id: admin._id.toString(), email: admin.email },
      secret,
      { expiresIn: tokenTtl as jwt.SignOptions['expiresIn'] }
    );

    // Return success response with token
    res.status(200).json({
      token,
      admin: {
        id: admin._id.toString(),
        email: admin.email
      }
    });
  } catch (error: any) {
    console.error('Admin login error:', error);
    res.status(500).json({
      error: true,
      message: 'Internal server error'
    });
  }
}
