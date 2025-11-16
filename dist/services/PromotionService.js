"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.promotionService = void 0;
const Promotion_1 = require("../entities/Promotion");
const ErrorResponse_1 = require("../utils/ErrorResponse");
const Category_1 = require("../entities/Category");
const Produit_1 = require("../entities/Produit");
const ProduitService_1 = require("./ProduitService");
const mongoose_1 = __importDefault(require("mongoose"));
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
exports.promotionService = {
    getAllPromotions: async () => {
        try {
            const promotions = await Promotion_1.Promotion.find()
                .populate({
                path: "produits",
                populate: [
                    {
                        path: "category",
                        model: "Category",
                    },
                ],
            })
                .populate("Fournisseur");
            return { success: true, data: promotions };
        }
        catch (error) {
            throw new ErrorResponse_1.ServiceError(error.message, 500);
        }
    },
    getPromotionById: async (id) => {
        try {
            const promotion = await Promotion_1.Promotion.findById(id).populate("produits");
            if (!promotion) {
                throw new ErrorResponse_1.ServiceError("Promotion not found", 404);
            }
            return { success: true, data: promotion };
        }
        catch (error) {
            throw new ErrorResponse_1.ServiceError(error.message, 500);
        }
    },
    createPromotion: async (promotionData) => {
        try {
            const produitsData = promotionData.produits;
            const cleanPromotionData = { ...promotionData };
            delete cleanPromotionData.produits;
            const promotion = new Promotion_1.Promotion(cleanPromotionData);
            promotion.produits = [];
            if (produitsData && produitsData.length > 0) {
                for (const produitData of produitsData) {
                    const createdProduitResponse = await ProduitService_1.produitService.createProduit(produitData);
                    if (createdProduitResponse.success && createdProduitResponse.data) {
                        const createdProduit = createdProduitResponse.data;
                        promotion.produits.push(createdProduit._id);
                    }
                    else {
                        throw new ErrorResponse_1.ServiceError("Failed to create product for promotion", 400);
                    }
                }
            }
            else {
                throw new ErrorResponse_1.ServiceError("At least one product must be associated with the promotion", 400);
            }
            await promotion.save();
            return { success: true, data: promotion };
        }
        catch (error) {
            console.error("Promotion creation error:", error);
            throw new ErrorResponse_1.ServiceError(error.message, 500);
        }
    },
    updatePromotion: async (promotionId, promotionData) => {
        try {
            const session = await mongoose_1.default.startSession();
            session.startTransaction();
            try {
                const existingPromotion = await Promotion_1.Promotion.findById(promotionId).session(session);
                if (!existingPromotion) {
                    throw new ErrorResponse_1.ServiceError("Promotion not found", 404);
                }
                const produitsData = promotionData.produits || [];
                const cleanPromotionData = { ...promotionData };
                delete cleanPromotionData.produits;
                delete cleanPromotionData.existingAfficheUrls;
                // Merge existing and new affiche URLs
                const newAfficheUrls = promotionData.afficheUrls || [];
                const existingAfficheUrls = promotionData.existingAfficheUrls || [];
                const allAfficheUrls = [...existingAfficheUrls, ...newAfficheUrls];
                // Delete old images from Cloudinary that are no longer needed
                const imagesToDelete = existingPromotion.afficheUrls?.filter((url) => !existingAfficheUrls.includes(url)) || [];
                for (const url of imagesToDelete) {
                    try {
                        const publicId = url.split("/").pop()?.split(".")[0];
                        if (publicId) {
                            await cloudinary_1.default.uploader.destroy(`ahaya_images/promotions/${publicId}`);
                        }
                    }
                    catch (cloudinaryError) {
                        console.error("Error deleting image from Cloudinary:", cloudinaryError);
                    }
                }
                // Update promotion fields
                Object.assign(existingPromotion, {
                    ...cleanPromotionData,
                    afficheUrls: allAfficheUrls,
                });
                // Handle products
                const newProductIds = [];
                if (produitsData && produitsData.length > 0) {
                    // Create new products for all provided produitsData
                    for (const produitData of produitsData) {
                        const createdProduitResponse = await ProduitService_1.produitService.createProduit(produitData);
                        if (createdProduitResponse.success && createdProduitResponse.data) {
                            const createdProduit = createdProduitResponse.data;
                            newProductIds.push(createdProduit._id);
                        }
                        else {
                            throw new ErrorResponse_1.ServiceError("Failed to create product for promotion", 400);
                        }
                    }
                    // Delete old products that are no longer associated
                    const existingProductIds = (existingPromotion.produits ?? []).map((id) => id.toString());
                    for (const productId of existingProductIds) {
                        try {
                            const product = await Produit_1.Produit.findById(productId).session(session);
                            if (product?.imageUrl) {
                                const publicId = product.imageUrl
                                    .split("/")
                                    .pop()
                                    ?.split(".")[0];
                                if (publicId) {
                                    await cloudinary_1.default.uploader.destroy(`ahaya_images/products/${publicId}`);
                                }
                            }
                            await Produit_1.Produit.findByIdAndDelete(productId).session(session);
                        }
                        catch (productError) {
                            console.error("Error deleting product:", productError);
                        }
                    }
                    existingPromotion.produits = newProductIds;
                }
                else {
                    throw new ErrorResponse_1.ServiceError("At least one product must be associated with the promotion", 400);
                }
                await existingPromotion.save({ session });
                await session.commitTransaction();
                return {
                    success: true,
                    data: existingPromotion.toObject(),
                };
            }
            catch (error) {
                await session.abortTransaction();
                throw error;
            }
            finally {
                await session.endSession();
            }
        }
        catch (error) {
            console.error("Promotion update error:", error);
            throw new ErrorResponse_1.ServiceError(error.message, error.status || 500);
        }
    },
    deletePromotion: async (id) => {
        try {
            const promotion = await Promotion_1.Promotion.findByIdAndDelete(id);
            if (!promotion) {
                throw new ErrorResponse_1.ServiceError("Promotion not found", 404);
            }
            return { success: true, data: promotion };
        }
        catch (error) {
            throw new ErrorResponse_1.ServiceError(error.message, 500);
        }
    },
    changeOffreStatus: async (id, statut) => {
        try {
            const promotion = await Promotion_1.Promotion.findByIdAndUpdate(id, { statut }, { new: true });
            if (!promotion) {
                throw new ErrorResponse_1.ServiceError("Promotion not found", 404);
            }
            return { success: true, data: promotion };
        }
        catch (error) {
            throw new ErrorResponse_1.ServiceError(error.message, 500);
        }
    },
    getPromotionsByFournisseur: async (fournisseurId) => {
        try {
            const promotions = await Promotion_1.Promotion.find({
                Fournisseur: fournisseurId,
            }).populate("produits");
            return { success: true, data: promotions };
        }
        catch (error) {
            throw new ErrorResponse_1.ServiceError(error.message, 500);
        }
    },
    getPromotionsByProduit: async (produitId) => {
        try {
            const promotions = await Promotion_1.Promotion.find({ "produits._id": produitId });
            return { success: true, data: promotions };
        }
        catch (error) {
            throw new ErrorResponse_1.ServiceError(error.message, 500);
        }
    },
    getPromotionsByCategory: async (categoryName) => {
        try {
            //find cat by name
            const category = await Category_1.Category.findOne({ nom: categoryName });
            if (!category)
                throw new Error("Category not found");
            //find all products in that category
            const products = await Produit_1.Produit.find({ category: category._id }).select("_id");
            const productIds = products.map((p) => p._id);
            //find promotions containing those products
            const promotions = await Promotion_1.Promotion.find({
                produits: { $in: productIds },
            });
            return { success: true, data: promotions };
        }
        catch (error) {
            throw new ErrorResponse_1.ServiceError(error.message, 500);
        }
    },
};
//# sourceMappingURL=PromotionService.js.map