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

// Single image upload middleware
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

export const uploadMultipleImagesToCloudinary = (fieldName: string) => [
  upload.array(fieldName),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      const uploadPromises = files.map((file) => {
        return new Promise<string>((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "ahaya_images" },
            (err, result) => {
              if (err) reject(err);
              else resolve(result?.secure_url || "");
            }
          );
          bufferToStream(file.buffer).pipe(stream);
        });
      });

      try {
        const uploadedUrls = await Promise.all(uploadPromises);
        (req as any).uploadedImageUrls = uploadedUrls;
        next();
      } catch (uploadError) {
        res.status(500).json({ error: uploadError });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
];

export const uploadPromotionWithProductImages = () => [
  upload.fields([{ name: "affiches" }, { name: "productImages" }]),

  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      if (!files || (!files.affiches && !files.productImages)) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      const uploadPromises: Promise<{
        type: string;
        url: string;
        index?: number;
      }>[] = [];

      if (files.affiches) {
        files.affiches.forEach((file, index) => {
          uploadPromises.push(
            new Promise((resolve, reject) => {
              const stream = cloudinary.uploader.upload_stream(
                { folder: "ahaya_images/promotions" },
                (err, result) => {
                  if (err) reject(err);
                  else
                    resolve({
                      type: "promotion",
                      url: result?.secure_url || "",
                      index,
                    });
                }
              );
              bufferToStream(file.buffer).pipe(stream);
            })
          );
        });
      }

      if (files.productImages) {
        files.productImages.forEach((file, index) => {
          uploadPromises.push(
            new Promise((resolve, reject) => {
              const stream = cloudinary.uploader.upload_stream(
                { folder: "ahaya_images/products" },
                (err, result) => {
                  if (err) reject(err);
                  else
                    resolve({
                      type: "product",
                      url: result?.secure_url || "",
                      index,
                    });
                }
              );
              bufferToStream(file.buffer).pipe(stream);
            })
          );
        });
      }

      try {
        const uploadResults = await Promise.all(uploadPromises);

        const promotionUrls = uploadResults
          .filter((result) => result.type === "promotion")
          .map((result) => result.url);

        const productUrls = uploadResults
          .filter((result) => result.type === "product")
          .map((result) => result.url);

        (req as any).uploadedPromotionUrls = promotionUrls;
        (req as any).uploadedProductUrls = productUrls;

        next();
      } catch (uploadError) {
        res.status(500).json({ error: uploadError });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
];
