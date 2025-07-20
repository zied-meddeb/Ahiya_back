import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'Root', 
  api_key: process.env.CLOUDINARY_API_KEY || '265763257689168',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'EW7aFQB-yewdm8q2DA1bGd9wGXE',
});

export default cloudinary;