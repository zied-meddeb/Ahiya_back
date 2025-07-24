import multer from "multer";
import { Request, Response, NextFunction } from "express";
import cloudinary from "../config/cloudinary";
import { Readable } from "stream";

// In-memory storage (no temp files saved locally)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Helper to convert buffer to stream
const bufferToStream = (buffer: Buffer) => {
  const readable = new Readable();
  readable.push(buffer);
  readable.push(null);
  return readable;
};

// Middleware to upload to Cloudinary
export const uploadImageToCloudinary = (fieldName: string) => [
  upload.single(fieldName),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const file = req.file;
      if (!file) return res.status(400).json({ message: "No file uploaded" });

      const stream = cloudinary.uploader.upload_stream(
        { folder: "ahaya_images" },
        (err, result) => {
          if (err) return res.status(500).json({ error: err.message });

          // Save Cloudinary URL in request for controller
          (req as any).uploadedImageUrl = result?.secure_url;
          next();
        }
      );

      bufferToStream(file.buffer).pipe(stream);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
];
