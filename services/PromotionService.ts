import { get } from "http";
import { IPromotion, Promotion } from "../entities/Promotion";
import { ServiceError } from "../utils/ErrorResponse";
import { Category } from "../entities/Category";
import { IProduit, Produit } from "../entities/Produit";
import { produitService } from "./ProduitService";
import mongoose, { Document } from "mongoose";

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
      const promotion = await Promotion.findById(id);
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
    id: string,
    promotionData: Partial<IPromotion>
  ): Promise<PromotionResponse> => {
    try {
      const promotion = await Promotion.findByIdAndUpdate(id, promotionData, {
        new: true,
      });
      if (!promotion) {
        throw new ServiceError("Promotion not found", 404);
      }
      return { success: true, data: promotion };
    } catch (error: any) {
      throw new ServiceError(error.message, 500);
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
        "produits.fournisseur": fournisseurId,
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
