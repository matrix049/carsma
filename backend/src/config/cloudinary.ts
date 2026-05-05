import { v2 as cloudinary } from 'cloudinary';

// Reads CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET
// from the environment (configured on Railway).
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const CLOUDINARY_FOLDER = 'l7it/products';

export default cloudinary;
