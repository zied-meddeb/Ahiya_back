"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadPromotionWithProductImagesUpdate = exports.uploadPromotionWithProductImages = exports.uploadMultipleImagesToCloudinary = exports.uploadImageToCloudinary = void 0;
const multer_1 = __importDefault(require("multer"));
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const stream_1 = require("stream");
// In-memory storage (no temp files saved locally)
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage });
// Helper to convert buffer to stream
const bufferToStream = (buffer) => {
    const readable = new stream_1.Readable();
    readable.push(buffer);
    readable.push(null);
    return readable;
};
// Single image upload middleware
const uploadImageToCloudinary = (fieldName) => [
    upload.single(fieldName),
    async (req, res, next) => {
        try {
            const file = req.file;
            if (!file)
                return res.status(400).json({ message: "No file uploaded" });
            const stream = cloudinary_1.default.uploader.upload_stream({ folder: "ahaya_images" }, (err, result) => {
                if (err)
                    return res.status(500).json({ error: err.message });
                // Save Cloudinary URL in request for controller
                req.uploadedImageUrl = result?.secure_url;
                next();
            });
            bufferToStream(file.buffer).pipe(stream);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
];
exports.uploadImageToCloudinary = uploadImageToCloudinary;
const uploadMultipleImagesToCloudinary = (fieldName) => [
    upload.array(fieldName),
    async (req, res, next) => {
        try {
            const files = req.files;
            if (!files || files.length === 0) {
                return res.status(400).json({ message: "No files uploaded" });
            }
            const uploadPromises = files.map((file) => {
                return new Promise((resolve, reject) => {
                    const stream = cloudinary_1.default.uploader.upload_stream({ folder: "ahaya_images" }, (err, result) => {
                        if (err)
                            reject(err);
                        else
                            resolve(result?.secure_url || "");
                    });
                    bufferToStream(file.buffer).pipe(stream);
                });
            });
            try {
                const uploadedUrls = await Promise.all(uploadPromises);
                req.uploadedImageUrls = uploadedUrls;
                next();
            }
            catch (uploadError) {
                res.status(500).json({ error: uploadError });
            }
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
];
exports.uploadMultipleImagesToCloudinary = uploadMultipleImagesToCloudinary;
const uploadPromotionWithProductImages = () => [
    upload.fields([{ name: "affiches" }, { name: "productImages" }]),
    async (req, res, next) => {
        try {
            const files = req.files;
            if (!files || (!files.affiches && !files.productImages)) {
                return res.status(400).json({ message: "No files uploaded" });
            }
            const uploadPromises = [];
            if (files.affiches) {
                files.affiches.forEach((file, index) => {
                    uploadPromises.push(new Promise((resolve, reject) => {
                        const stream = cloudinary_1.default.uploader.upload_stream({ folder: "ahaya_images/promotions" }, (err, result) => {
                            if (err)
                                reject(err);
                            else
                                resolve({
                                    type: "promotion",
                                    url: result?.secure_url || "",
                                    index,
                                });
                        });
                        bufferToStream(file.buffer).pipe(stream);
                    }));
                });
            }
            if (files.productImages) {
                files.productImages.forEach((file, index) => {
                    uploadPromises.push(new Promise((resolve, reject) => {
                        const stream = cloudinary_1.default.uploader.upload_stream({ folder: "ahaya_images/products" }, (err, result) => {
                            if (err)
                                reject(err);
                            else
                                resolve({
                                    type: "product",
                                    url: result?.secure_url || "",
                                    index,
                                });
                        });
                        bufferToStream(file.buffer).pipe(stream);
                    }));
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
                req.uploadedPromotionUrls = promotionUrls;
                req.uploadedProductUrls = productUrls;
                next();
            }
            catch (uploadError) {
                res.status(500).json({ error: uploadError });
            }
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
];
exports.uploadPromotionWithProductImages = uploadPromotionWithProductImages;
const uploadPromotionWithProductImagesUpdate = () => [
    upload.fields([{ name: "affiches", maxCount: 10 }, { name: "productImages", maxCount: 10 }]),
    async (req, res, next) => {
        try {
            const files = req.files;
            // Initialize empty arrays if no files were uploaded
            req.uploadedPromotionUrls = [];
            req.uploadedProductUrls = [];
            if (files) {
                const uploadPromises = [];
                if (files.affiches) {
                    files.affiches.forEach((file, index) => {
                        uploadPromises.push(new Promise((resolve, reject) => {
                            const stream = cloudinary_1.default.uploader.upload_stream({ folder: "ahaya_images/promotions" }, (err, result) => {
                                if (err)
                                    reject(err);
                                else
                                    resolve({
                                        type: "promotion",
                                        url: result?.secure_url || "",
                                        index,
                                    });
                            });
                            bufferToStream(file.buffer).pipe(stream);
                        }));
                    });
                }
                if (files.productImages) {
                    files.productImages.forEach((file, index) => {
                        uploadPromises.push(new Promise((resolve, reject) => {
                            const stream = cloudinary_1.default.uploader.upload_stream({ folder: "ahaya_images/products" }, (err, result) => {
                                if (err)
                                    reject(err);
                                else
                                    resolve({
                                        type: "product",
                                        url: result?.secure_url || "",
                                        index,
                                    });
                            });
                            bufferToStream(file.buffer).pipe(stream);
                        }));
                    });
                }
                if (uploadPromises.length > 0) {
                    const uploadResults = await Promise.all(uploadPromises);
                    req.uploadedPromotionUrls = uploadResults
                        .filter((result) => result.type === "promotion")
                        .map((result) => result.url);
                    req.uploadedProductUrls = uploadResults
                        .filter((result) => result.type === "product")
                        .map((result) => result.url);
                }
            }
            next();
        }
        catch (error) {
            console.error('Upload middleware error:', error);
            // Don't fail here - let the controller handle missing files
            next();
        }
    },
];
exports.uploadPromotionWithProductImagesUpdate = uploadPromotionWithProductImagesUpdate;
//# sourceMappingURL=upload.js.map