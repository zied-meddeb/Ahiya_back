import { get } from "http";
import { IPromotion, Promotion } from "../entities/Promotion";
import { ServiceError } from "../utils/ErrorResponse";
import { Category } from "../entities/Category";
import { IProduit, Produit } from "../entities/Produit";
import { produitService } from "./ProduitService";
import mongoose, { Document } from "mongoose";
import cloudinary from "../config/cloudinary"

interface PromotionResponse {
  success: boolean;
  message?: string;
  data?: IPromotion | IPromotion[];
}

export const promotionService = {
  getAllPromotions: async (): Promise<PromotionResponse> => {
    try {
      const promotions = await Promotion.find()
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
    } catch (error: any) {
      throw new ServiceError(error.message, 500);
    }
  },

  getPromotionById: async (id: string): Promise<PromotionResponse> => {
    try {
      const promotion = await Promotion.findById(id).populate("produits");
      if (!promotion) {
        throw new ServiceError("Promotion not found", 404);
      }
      return { success: true, data: promotion };
    } catch (error: any) {
      throw new ServiceError(error.message, 500);
    }
  },

  createPromotion: async (
    promotionData: Partial<IPromotion>
  ): Promise<PromotionResponse> => {
    try {
      const produitsData = promotionData.produits;

      const cleanPromotionData = { ...promotionData };
      delete cleanPromotionData.produits;

      const promotion = new Promotion(cleanPromotionData);
      promotion.produits = [];

      if (produitsData && produitsData.length > 0) {
        for (const produitData of produitsData) {
          const createdProduitResponse = await produitService.createProduit(
            produitData as unknown as IProduit
          );
          if (createdProduitResponse.success && createdProduitResponse.data) {
            const createdProduit =
              createdProduitResponse.data as mongoose.Document;
            promotion.produits.push(
              createdProduit._id as mongoose.Schema.Types.ObjectId
            );
          } else {
            throw new ServiceError(
              "Failed to create product for promotion",
              400
            );
          }
        }
      } else {
        throw new ServiceError(
          "At least one product must be associated with the promotion",
          400
        );
      }

      await promotion.save();
      return { success: true, data: promotion };
    } catch (error: any) {
      console.error("Promotion creation error:", error);
      throw new ServiceError(error.message, 500);
    }
  },

 updatePromotion: async (
  promotionId: string,
  promotionData: Partial<IPromotion> & { existingAfficheUrls?: string[] }
): Promise<PromotionResponse> => {
  try {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const existingPromotion = await Promotion.findById(promotionId).session(session);
      if (!existingPromotion) {
        throw new ServiceError('Promotion not found', 404);
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
      const imagesToDelete = existingPromotion.afficheUrls?.filter(
        (url) => !existingAfficheUrls.includes(url)
      ) || [];

      for (const url of imagesToDelete) {
        try {
          const publicId = url.split('/').pop()?.split('.')[0];
          if (publicId) {
            await cloudinary.uploader.destroy(`ahaya_images/promotions/${publicId}`);
          }
        } catch (cloudinaryError) {
          console.error('Error deleting image from Cloudinary:', cloudinaryError);
        }
      }

      // Update promotion fields
      Object.assign(existingPromotion, {
        ...cleanPromotionData,
        afficheUrls: allAfficheUrls,
      });

      // Handle products
      const newProductIds: mongoose.Schema.Types.ObjectId[] = [];
      
      if (produitsData && produitsData.length > 0) {
        // Create new products for all provided produitsData
        for (const produitData of produitsData) {
          const createdProduitResponse = await produitService.createProduit(
            produitData as unknown as IProduit,
          );
          
          if (createdProduitResponse.success && createdProduitResponse.data) {
            const createdProduit = createdProduitResponse.data as mongoose.Document;
            newProductIds.push(createdProduit._id as mongoose.Schema.Types.ObjectId);
          } else {
            throw new ServiceError('Failed to create product for promotion', 400);
          }
        }

        // Delete old products that are no longer associated
        const existingProductIds = (existingPromotion.produits ?? []).map(id => id.toString());
        for (const productId of existingProductIds) {
          try {
            const product = await Produit.findById(productId).session(session);
            if (product?.imageUrl) {
              const publicId = product.imageUrl.split('/').pop()?.split('.')[0];
              if (publicId) {
                await cloudinary.uploader.destroy(`ahaya_images/products/${publicId}`);
              }
            }
            await Produit.findByIdAndDelete(productId).session(session);
          } catch (productError) {
            console.error('Error deleting product:', productError);
          }
        }

        existingPromotion.produits = newProductIds;
      } else {
        throw new ServiceError(
          'At least one product must be associated with the promotion',
          400
        );
      }

      await existingPromotion.save({ session });
      await session.commitTransaction();
      
      return { 
        success: true, 
        data: existingPromotion.toObject() 
      };
    } catch (error: any) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  } catch (error: any) {
    console.error('Promotion update error:', error);
    throw new ServiceError(error.message, error.status || 500);
  }
},


  deletePromotion: async (id: string): Promise<PromotionResponse> => {
    try {
      const promotion = await Promotion.findByIdAndDelete(id);
      if (!promotion) {
        throw new ServiceError("Promotion not found", 404);
      }
      return { success: true, data: promotion };
    } catch (error: any) {
      throw new ServiceError(error.message, 500);
    }
  },

  changeOffreStatus: async (
    id: string,
    statut: string
  ): Promise<PromotionResponse> => {
    try {
      const promotion = await Promotion.findByIdAndUpdate(
        id,
        { statut },
        { new: true }
      );
      if (!promotion) {
        throw new ServiceError("Promotion not found", 404);
      }
      return { success: true, data: promotion };
    } catch (error: any) {
      throw new ServiceError(error.message, 500);
    }
  },

  getPromotionsByFournisseur: async (
    fournisseurId: string
  ): Promise<PromotionResponse> => {
    try {
      const promotions = await Promotion.find({
        "Fournisseur": fournisseurId,
      });
      return { success: true, data: promotions };
    } catch (error: any) {
      throw new ServiceError(error.message, 500);
    }
  },

  getPromotionsByProduit: async (
    produitId: string
  ): Promise<PromotionResponse> => {
    try {
      const promotions = await Promotion.find({ "produits._id": produitId });
      return { success: true, data: promotions };
    } catch (error: any) {
      throw new ServiceError(error.message, 500);
    }
  },

  getPromotionsByCategory: async (
    categoryName: string
  ): Promise<PromotionResponse> => {
    try {
      //find cat by name
      const category = await Category.findOne({ nom: categoryName });
      if (!category) throw new Error("Category not found");

      //find all products in that category
      const products = await Produit.find({ category: category._id }).select(
        "_id"
      );
      const productIds = products.map((p) => p._id);

      //find promotions containing those products
      const promotions = await Promotion.find({
        produits: { $in: productIds },
      });

      return { success: true, data: promotions };
    } catch (error: any) {
      throw new ServiceError(error.message, 500);
    }
  },
};
