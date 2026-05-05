import { Router, Request, Response } from 'express';
import multer from 'multer';
import { UploadApiResponse } from 'cloudinary';
import cloudinary, { CLOUDINARY_FOLDER } from '../config/cloudinary';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Buffer the upload in memory so we can stream it straight to Cloudinary
// without touching the Railway container's disk (which is ephemeral).
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB — Cloudinary will compress on the fly
  },
});

function uploadBufferToCloudinary(buffer: Buffer): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: CLOUDINARY_FOLDER,
        resource_type: 'image',
      },
      (err, result) => {
        if (err || !result) {
          reject(err ?? new Error('Cloudinary upload returned no result'));
          return;
        }
        resolve(result);
      }
    );
    stream.end(buffer);
  });
}

/**
 * Upload product image
 * POST /api/upload/image
 * Admin only — streams the file to Cloudinary and returns the CDN URL.
 */
router.post('/image', authenticateToken, upload.single('image'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({
        error: true,
        message: 'No image file provided',
      });
      return;
    }

    const result = await uploadBufferToCloudinary(req.file.buffer);

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      imageUrl: result.secure_url,
      filename: result.public_id, // we use public_id so the delete endpoint can target the right asset
    });
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to upload image',
    });
  }
});

/**
 * Delete uploaded image
 * DELETE /api/upload/image/:filename
 * Admin only — `:filename` is the Cloudinary public_id we returned at upload time
 * (URL-encoded because it contains slashes from the folder prefix).
 */
router.delete('/image/:filename', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    if (typeof filename !== 'string' || !filename) {
      res.status(400).json({
        error: true,
        message: 'Invalid filename parameter',
      });
      return;
    }

    const publicId = decodeURIComponent(filename);
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });

    if (result.result !== 'ok' && result.result !== 'not found') {
      res.status(500).json({
        error: true,
        message: `Cloudinary destroy returned: ${result.result}`,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully',
    });
  } catch (error: any) {
    console.error('Cloudinary delete error:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to delete image',
    });
  }
});

export default router;
