import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, `product-${uniqueSuffix}${extension}`);
  }
});

// File filter to only allow images
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

/**
 * Upload product image
 * POST /api/upload/image
 * Admin only - uploads a single image file
 */
router.post('/image', authenticateToken, upload.single('image'), (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({
        error: true,
        message: 'No image file provided'
      });
      return;
    }

    // Return the file path that can be used as image URL
    // For production, use full URL; for development, use relative path
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? (process.env.API_BASE_URL || 'https://api.l7it.art')
      : '';
    const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
    
    // Log upload details for debugging
    console.log('File uploaded successfully:', {
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: req.file.size,
      path: req.file.path,
      imageUrl,
      baseUrl,
      nodeEnv: process.env.NODE_ENV
    });

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      imageUrl,
      filename: req.file.filename
    });
  } catch (error: any) {
    console.error('Image upload error:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to upload image'
    });
  }
});

/**
 * Test endpoint to check uploaded files
 * GET /api/upload/test
 * Admin only - lists uploaded files for debugging
 */
router.get('/test', authenticateToken, (req: Request, res: Response) => {
  try {
    const files = fs.readdirSync(uploadsDir);
    res.status(200).json({
      success: true,
      uploadsDir,
      files,
      count: files.length
    });
  } catch (error: any) {
    console.error('Test endpoint error:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to read uploads directory',
      uploadsDir
    });
  }
});

/**
 * Delete uploaded image
 * DELETE /api/upload/image/:filename
 * Admin only - deletes an uploaded image file
 */
router.delete('/image/:filename', authenticateToken, (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    
    // Ensure filename is a string
    if (typeof filename !== 'string') {
      res.status(400).json({
        error: true,
        message: 'Invalid filename parameter'
      });
      return;
    }

    const filePath = path.join(uploadsDir, filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      res.status(404).json({
        error: true,
        message: 'Image file not found'
      });
      return;
    }

    // Delete the file
    fs.unlinkSync(filePath);

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error: any) {
    console.error('Image deletion error:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to delete image'
    });
  }
});

export default router;