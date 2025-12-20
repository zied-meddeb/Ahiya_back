import { get } from "http";
import { IPromotion, Promotion } from "../entities/Promotion";
import { ServiceError } from "../utils/ErrorResponse";
import { Category } from "../entities/Category";
import { IProduit, Produit } from "../entities/Produit";
import { produitService } from "./ProduitService";
import mongoose, { Document } from "mongoose";
import cloudinary from "../config/cloudinary";

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
          path: "produit",
          populate: [
            {
              path: "category",
              model: "Category",
            },
          ],
        })
        .populate("Fournisseur");

      // Handle legacy promotions with produits array - populate the first product
      const processedPromotions = await Promise.all(
        promotions.map(async (promo: any) => {
          const promoObj: any = promo.toObject ? promo.toObject() : promo;

          // Check if produit is already populated (has category or nom field, not just _id)
          const isProduitPopulated =
            promoObj.produit &&
            typeof promoObj.produit === "object" &&
            promoObj.produit._id &&
            (promoObj.produit.category ||
              promoObj.produit.nom ||
              promoObj.produit.description);

          if (isProduitPopulated) {
            // produit is already populated, return as is
            return promoObj;
          }

          // If produit exists but is not populated (just an ID), populate it
          if (promoObj.produit) {
            let productId: string | null = null;

            if (typeof promoObj.produit === "string") {
              productId = promoObj.produit;
            } else if (promoObj.produit._id) {
              productId = promoObj.produit._id.toString();
            } else if (promoObj.produit.toString) {
              productId = promoObj.produit.toString();
            }

            if (productId) {
              try {
                const product = await Produit.findById(productId).populate({
                  path: "category",
                  model: "Category",
                });

                if (product) {
                  promoObj.produit = product.toObject
                    ? product.toObject()
                    : product;
                }
              } catch (err) {
                console.error(`Error populating product ${productId}:`, err);
              }
            }
          }

          // Handle legacy produits array (check raw document)
          if (
            !promoObj.produit ||
            (!promoObj.produit.category && !promoObj.produit.nom)
          ) {
            const rawPromo: any = promo.toObject
              ? promo.toObject({ getters: false, virtuals: false })
              : promo;
            if (
              rawPromo.produits &&
              Array.isArray(rawPromo.produits) &&
              rawPromo.produits.length > 0
            ) {
              const firstProductId = rawPromo.produits[0];
              let productId: string | null = null;

              if (typeof firstProductId === "string") {
                productId = firstProductId;
              } else if (firstProductId._id) {
                productId = firstProductId._id.toString();
              } else if (firstProductId.toString) {
                productId = firstProductId.toString();
              }

              if (productId) {
                try {
                  const product = await Produit.findById(productId).populate({
                    path: "category",
                    model: "Category",
                  });

                  if (product) {
                    promoObj.produit = product.toObject
                      ? product.toObject()
                      : product;
                  }
                } catch (err) {
                  console.error(
                    `Error populating product from produits array ${productId}:`,
                    err
                  );
                }
              }
            }
          }

          return promoObj;
        })
      );

      return { success: true, data: processedPromotions };
    } catch (error: any) {
      throw new ServiceError(error.message, 500);
    }
  },

  getPromotionById: async (id: string): Promise<PromotionResponse> => {
    try {
      const promotion = await Promotion.findById(id)
        .populate({
          path: "produit",
          populate: [
            {
              path: "category",
              model: "Category",
            },
          ],
        })
        .populate("Fournisseur");
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
      const promotionDataAny = promotionData as any;
      const produitsData = promotionDataAny.produits || promotionData.produit;

      // Handle both array (for backward compatibility) and single product
      const produitData = Array.isArray(produitsData)
        ? produitsData[0]
        : produitsData;

      const cleanPromotionData: any = { ...promotionData };
      delete cleanPromotionData.produits;
      delete cleanPromotionData.produit;

      const promotion = new Promotion(cleanPromotionData);

      if (produitData) {
        const createdProduitResponse = await produitService.createProduit(
          produitData as unknown as IProduit
        );
        if (createdProduitResponse.success && createdProduitResponse.data) {
          const createdProduit =
            createdProduitResponse.data as mongoose.Document;
          promotion.produit =
            createdProduit._id as mongoose.Schema.Types.ObjectId;
        } else {
          throw new ServiceError("Failed to create product for promotion", 400);
        }
      } else {
        throw new ServiceError(
          "A product must be associated with the promotion",
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
        const existingPromotion = await Promotion.findById(promotionId).session(
          session
        );
        if (!existingPromotion) {
          throw new ServiceError("Promotion not found", 404);
        }

        const promotionDataAny = promotionData as any;
        const produitsData = promotionDataAny.produits || promotionData.produit;
        // Handle both array (for backward compatibility) and single product
        const produitData = Array.isArray(produitsData)
          ? produitsData[0]
          : produitsData;

        const cleanPromotionData: any = { ...promotionData };
        delete cleanPromotionData.produits;
        delete cleanPromotionData.produit;
        delete cleanPromotionData.existingAfficheUrls;

        // Merge existing and new affiche URLs
        const newAfficheUrls = promotionData.afficheUrls || [];
        const existingAfficheUrls = promotionData.existingAfficheUrls || [];
        const allAfficheUrls = [...existingAfficheUrls, ...newAfficheUrls];

        // Delete old images from Cloudinary that are no longer needed
        const imagesToDelete =
          existingPromotion.afficheUrls?.filter(
            (url) => !existingAfficheUrls.includes(url)
          ) || [];

        for (const url of imagesToDelete) {
          try {
            const publicId = url.split("/").pop()?.split(".")[0];
            if (publicId) {
              await cloudinary.uploader.destroy(
                `ahaya_images/promotions/${publicId}`
              );
            }
          } catch (cloudinaryError) {
            console.error(
              "Error deleting image from Cloudinary:",
              cloudinaryError
            );
          }
        }

        // Update promotion fields
        Object.assign(existingPromotion, {
          ...cleanPromotionData,
          afficheUrls: allAfficheUrls,
        });

        // Handle product (single product now)
        if (produitData) {
          // Create new product
          const createdProduitResponse = await produitService.createProduit(
            produitData as unknown as IProduit
          );

          if (createdProduitResponse.success && createdProduitResponse.data) {
            const createdProduit =
              createdProduitResponse.data as mongoose.Document;

            // Delete old product if it exists
            if (existingPromotion.produit) {
              try {
                const oldProductId = existingPromotion.produit.toString();
                const product = await Produit.findById(oldProductId).session(
                  session
                );
                if (product?.imageUrl) {
                  const publicId = product.imageUrl
                    .split("/")
                    .pop()
                    ?.split(".")[0];
                  if (publicId) {
                    await cloudinary.uploader.destroy(
                      `ahaya_images/products/${publicId}`
                    );
                  }
                }
                await Produit.findByIdAndDelete(oldProductId).session(session);
              } catch (productError) {
                console.error("Error deleting product:", productError);
              }
            }

            existingPromotion.produit =
              createdProduit._id as mongoose.Schema.Types.ObjectId;
          } else {
            throw new ServiceError(
              "Failed to create product for promotion",
              400
            );
          }
        } else {
          throw new ServiceError(
            "A product must be associated with the promotion",
            400
          );
        }

        await existingPromotion.save({ session });
        await session.commitTransaction();

        return {
          success: true,
          data: existingPromotion.toObject(),
        };
      } catch (error: any) {
        await session.abortTransaction();
        throw error;
      } finally {
        await session.endSession();
      }
    } catch (error: any) {
      console.error("Promotion update error:", error);
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
        Fournisseur: fournisseurId,
      }).populate("produit");
      return { success: true, data: promotions };
    } catch (error: any) {
      throw new ServiceError(error.message, 500);
    }
  },

  getPromotionsByProduit: async (
    produitId: string
  ): Promise<PromotionResponse> => {
    try {
      const promotions = await Promotion.find({ produit: produitId });
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
        produit: { $in: productIds },
      });

      return { success: true, data: promotions };
    } catch (error: any) {
      throw new ServiceError(error.message, 500);
    }
  },
};
