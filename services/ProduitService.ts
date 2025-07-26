import { Types } from "mongoose";
import { IProduit, Produit } from "../entities/Produit";
import { ICategory, Category } from "../entities/Category";
import { IFournisseur, Fournisseur } from "../entities/Fournisseur";
import { ServiceError } from "../utils/ErrorResponse";

import { Document } from "mongoose";

interface ProduitResponse {
  success: boolean;
  message?: string;
  data?: IProduit | IProduit[] | Document | Document[];
  count?: number;
}

interface SearchCriteria {
  priceMin?: number;
  priceMax?: number;
  category?: string;
  fournisseur?: string;
  status?: string;
  verified?: string;
  nom?: string;
}

export const produitService = {
  getAllProduits: async (): Promise<ProduitResponse> => {
    try {
      const produits = await Produit.find()
        .populate<{ category: ICategory }>("category", "nom")
        .populate<{ fournisseur: IFournisseur }>("fournisseur", "nom");

      if (!produits || produits.length === 0) {
        throw new ServiceError("No products found", 404);
      }

      return {
        success: true,
        data: produits,
        count: produits.length,
      };
    } catch (error: any) {
      if (error instanceof ServiceError) throw error;
      throw new ServiceError(`Failed to fetch products: ${error.message}`, 500);
    }
  },

  getProduitById: async (id: string): Promise<ProduitResponse> => {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new ServiceError("Invalid product ID format", 400);
      }

      const produit = await Produit.findById(id)
        .populate<{ category: ICategory }>("category", "nom")
        .populate<{ fournisseur: IFournisseur }>("fournisseur", "nom");

      if (!produit) {
        throw new ServiceError("Product not found", 404);
      }

      return {
        success: true,
        data: produit,
      };
    } catch (error: any) {
      if (error instanceof ServiceError) throw error;
      throw new ServiceError(`Failed to fetch product: ${error.message}`, 500);
    }
  },

  createProduit: async (
    produitData: Partial<IProduit>
  ): Promise<ProduitResponse> => {
    try {
      const categoryExists = await Category.findById(produitData.category);
      if (!categoryExists) {
        throw new ServiceError("Category not found", 404);
      }

      const fournisseurExists = await Fournisseur.findById(
        produitData.fournisseur
      );
      if (!fournisseurExists) {
        throw new ServiceError("Supplier not found", 404);
      }

      const mappedProduitData = {
        nom: produitData.nom,
        description: produitData.description,
        category: produitData.category,
        fournisseur: produitData.fournisseur,
        imageUrl: produitData.imageUrl,
        verified: produitData.verified || false,
        lien_produit: produitData.lien_produit,
        views: produitData.views || 0,
        tags: produitData.tags || [],
        checked_by: produitData.checked_by,
        prix:produitData.prix,
      };

      const produit = new Produit(mappedProduitData);
      await produit.save();

      return {
        success: true,
        message: "Product created successfully",
        data: produit,
      };
    } catch (error: any) {
      console.error("Product creation error:", error);
      if (error instanceof ServiceError) throw error;
      throw new ServiceError(`Product creation failed: ${error.message}`, 500);
    }
  },

  updateProduit: async (
    id: string,
    produitData: Partial<IProduit>
  ): Promise<ProduitResponse> => {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new ServiceError("Invalid product ID format", 400);
      }

      if (produitData.views) {
        throw new ServiceError("Views cannot be updated directly", 400);
      }

      const produit = await Produit.findByIdAndUpdate(id, produitData, {
        new: true,
        runValidators: true,
      })
        .populate<{ category: ICategory }>("category", "nom")
        .populate<{ fournisseur: IFournisseur }>("fournisseur", "nom");

      if (!produit) {
        throw new ServiceError("Product not found", 404);
      }

      return {
        success: true,
        message: "Product updated successfully",
        data: produit,
      };
    } catch (error: any) {
      if (error instanceof ServiceError) throw error;
      throw new ServiceError(`Product update failed: ${error.message}`, 500);
    }
  },

  deleteProduit: async (id: string): Promise<ProduitResponse> => {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new ServiceError("Invalid product ID format", 400);
      }

      const produit = await Produit.findByIdAndDelete(id);
      if (!produit) {
        throw new ServiceError("Product not found", 404);
      }

      return {
        success: true,
        message: "Product deleted successfully",
        data: produit,
      };
    } catch (error: any) {
      if (error instanceof ServiceError) throw error;
      throw new ServiceError(`Product deletion failed: ${error.message}`, 500);
    }
  },

  searchByCriteria: async (
    criteria: SearchCriteria = {}
  ): Promise<ProduitResponse> => {
    try {
      const query: any = {};

      // Price range validation
      if (typeof criteria.priceMin !== "undefined") {
        const priceMin = Number(criteria.priceMin);
        if (isNaN(priceMin)) {
          throw new ServiceError("Invalid minimum price value", 400);
        }
        query.prix = query.prix || {};
        query.prix.$gte = priceMin;
      }

      if (typeof criteria.priceMax !== "undefined") {
        const priceMax = Number(criteria.priceMax);
        if (isNaN(priceMax)) {
          throw new ServiceError("Invalid maximum price value", 400);
        }
        query.prix = query.prix || {};
        query.prix.$lte = priceMax;
      }

      if (
        query.prix?.$gte &&
        query.prix?.$lte &&
        query.prix.$gte > query.prix.$lte
      ) {
        throw new ServiceError(
          "Minimum price cannot be greater than maximum price",
          400
        );
      }

      let category = {};
      if (typeof criteria.category !== "undefined") {
        const categories = await Category.find({
          nom: { $regex: criteria.category, $options: "i" },
        });

        if (!categories || categories.length === 0) {
          throw new ServiceError("No matching categories found", 404);
        }

        category = { category: { $in: categories.map((c) => c._id) } };
      }

      let fournisseur = {};
      if (typeof criteria.fournisseur !== "undefined") {
        const fournisseurs = await Fournisseur.find({
          nom: { $regex: criteria.fournisseur, $options: "i" },
        });

        if (!fournisseurs || fournisseurs.length === 0) {
          throw new ServiceError("No matching suppliers found", 404);
        }

        fournisseur = { fournisseur: { $in: fournisseurs.map((c) => c._id) } };
      }

      if (typeof criteria.status !== "undefined") {
        if (
          !["disponible", "indisponible", "en rupture"].includes(
            criteria.status
          )
        ) {
          throw new ServiceError("Invalid status value", 400);
        }
        query.status = criteria.status;
      }

      if (typeof criteria.verified !== "undefined") {
        query.verified = criteria.verified === "true";
      }

      if (typeof criteria.nom !== "undefined") {
        query.nom = { $regex: criteria.nom, $options: "i" };
      }

      const produits = await Produit.find({
        ...query,
        ...category,
        ...fournisseur,
      })
        .populate<{ category: ICategory }>({
          path: "category",
          select: "nom",
        })
        .populate<{ fournisseur: IFournisseur }>("fournisseur");

      if (!produits || produits.length === 0) {
        throw new ServiceError("No products matching the criteria", 404);
      }

      return {
        success: true,
        data: produits,
        count: produits.length,
      };
    } catch (error: any) {
      if (error instanceof ServiceError) throw error;
      throw new ServiceError(`Product search failed: ${error.message}`, 500);
    }
  },

  getProductsByCategory: async (
    categoryId: string,
    limit = 10
  ): Promise<ProduitResponse> => {
    try {
      if (!Types.ObjectId.isValid(categoryId)) {
        throw new ServiceError("Invalid category ID format", 400);
      }

      const categoryExists = await Category.findById(categoryId);
      if (!categoryExists) {
        throw new ServiceError("Category not found", 404);
      }

      const produits = await Produit.find({
        category: categoryId,
      })
        .sort({ "promotion.pourcentage": -1 })
        .limit(Number(limit))
        .populate<{ category: ICategory }>("category", "nom")
        .populate<{ fournisseur: IFournisseur }>("fournisseur", "nom");

      if (!produits || produits.length === 0) {
        throw new ServiceError("No products found in this category", 404);
      }

      return {
        success: true,
        data: produits,
        count: produits.length,
      };
    } catch (error: any) {
      if (error instanceof ServiceError) throw error;
      throw new ServiceError(
        `Failed to get products by category: ${error.message}`,
        500
      );
    }
  },

  getPopularProducts: async (limit = 10): Promise<ProduitResponse> => {
    try {
      const produits = await Produit.find()
        .sort({ views: -1 })
        .limit(Number(limit))
        .populate<{ category: ICategory }>("category", "nom")
        .populate<{ fournisseur: IFournisseur }>("fournisseur", "nom");

      if (!produits || produits.length === 0) {
        throw new ServiceError("No popular products found", 404);
      }

      return {
        success: true,
        data: produits,
        count: produits.length,
      };
    } catch (error: any) {
      if (error instanceof ServiceError) throw error;
      throw new ServiceError(
        `Failed to get popular products: ${error.message}`,
        500
      );
    }
  },

  getProductsByFournisseur: async (
    fournisseurId: string
  ): Promise<ProduitResponse> => {
    try {
      if (!Types.ObjectId.isValid(fournisseurId)) {
        throw new ServiceError("Invalid supplier ID format", 400);
      }

      const fournisseurExists = await Fournisseur.findById(fournisseurId);
      if (!fournisseurExists) {
        throw new ServiceError("Supplier not found", 404);
      }

      const produits = await Produit.find({
        fournisseur: fournisseurId,
      }).populate<{ category: ICategory }>("category", "nom");

      if (!produits || produits.length === 0) {
        throw new ServiceError("No products found for this supplier", 404);
      }

      return {
        success: true,
        data: produits,
        count: produits.length,
      };
    } catch (error: any) {
      if (error instanceof ServiceError) throw error;
      throw new ServiceError(
        `Failed to get products by supplier: ${error.message}`,
        500
      );
    }
  },

  incrementProductViews: async (
    productId: string
  ): Promise<ProduitResponse> => {
    try {
      if (!Types.ObjectId.isValid(productId)) {
        throw new ServiceError("Invalid product ID format", 400);
      }

      const produit = await Produit.findByIdAndUpdate(
        productId,
        { $inc: { views: 1 } },
        { new: true }
      )
        .populate<{ category: ICategory }>("category", "nom")
        .populate<{ fournisseur: IFournisseur }>("fournisseur", "nom");

      if (!produit) {
        throw new ServiceError("Product not found", 404);
      }

      return {
        success: true,
        message: "Product views incremented",
        data: produit,
      };
    } catch (error: any) {
      if (error instanceof ServiceError) throw error;
      throw new ServiceError(
        `Failed to increment product views: ${error.message}`,
        500
      );
    }
  },

  getBestDiscounts: async (limit = 10): Promise<ProduitResponse> => {
    try {
      const produits = await Produit.find({
        "promotion.pourcentage": { $exists: true, $gt: 0 },
      })
        .sort({ "promotion.pourcentage": -1 })
        .limit(Number(limit))
        .populate<{ category: ICategory }>("category", "nom")
        .populate<{ fournisseur: IFournisseur }>("fournisseur", "nom");

      if (!produits || produits.length === 0) {
        throw new ServiceError("No discounted products found", 404);
      }

      return {
        success: true,
        data: produits,
        count: produits.length,
      };
    } catch (error: any) {
      if (error instanceof ServiceError) throw error;
      throw new ServiceError(
        `Failed to get discounted products: ${error.message}`,
        500
      );
    }
  },

  getCurrentPromotions: async (): Promise<ProduitResponse> => {
    try {
      const now = new Date();
      const produits = await Produit.find({
        "promotion.date_debut": { $lte: now },
        "promotion.date_fin": { $gte: now },
        status: "disponible",
      })
        .sort({ "promotion.pourcentage": -1 })
        .limit(10)
        .populate<{ category: ICategory }>("category", "nom")
        .populate<{ fournisseur: IFournisseur }>("fournisseur", "nom");

      if (!produits || produits.length === 0) {
        throw new ServiceError("No current promotions available", 404);
      }

      return {
        success: true,
        data: produits,
        count: produits.length,
      };
    } catch (error: any) {
      if (error instanceof ServiceError) throw error;
      throw new ServiceError(
        `Failed to get current promotions: ${error.message}`,
        500
      );
    }
  },
};

export default produitService;
