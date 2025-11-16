import express, { Request, Response, Router } from "express";
import { promotionService } from "../services/PromotionService";
import { verifyToken } from "../middleware/middleware";
import { handleResponse, handleError } from "../utils/responseHandler";
import {
  uploadPromotionWithProductImages,
  uploadPromotionWithProductImagesUpdate,
} from "../middleware/upload";
import { JwtPayload } from "jsonwebtoken";

const PromotionController: Router = express.Router();

PromotionController.get(`/`, async (req: Request, res: Response) => {
  try {
    const promotions = await promotionService.getAllPromotions();
    handleResponse(res, promotions);
  } catch (error: any) {
    handleError(res, error);
  }
});

PromotionController.get(`/:id`, async (req: Request, res: Response) => {
  try {
    const promotion = await promotionService.getPromotionById(req.params.id);
    handleResponse(res, promotion);
  } catch (error: any) {
    handleError(res, error);
  }
});

// Get promotions by fournisseur ID
PromotionController.get(
  "/fournisseur/:fournisseurId",
  async (req: Request, res: Response) => {
    if (!req.params.fournisseurId) {
      return res.status(400).json({ message: "Fournisseur ID is required." });
    }
    try {
      const promotions = await promotionService.getPromotionsByFournisseur(
        req.params.fournisseurId
      );
      handleResponse(res, promotions);
    } catch (error: any) {
      handleError(res, error);
    }
  }
);

PromotionController.post(
  "/",
  uploadPromotionWithProductImagesUpdate(),
  async (req: any, res: any) => {
    try {
      if (req.uploadedPromotionUrls && req.uploadedPromotionUrls.length > 0) {
        req.body.afficheUrls = req.uploadedPromotionUrls;
      }

      if (typeof req.body.produits === "string") {
        try {
          req.body.produits = JSON.parse(req.body.produits);
        } catch (parseError) {
          return res.status(400).json({
            message: "Invalid JSON format for produits field",
            error:
              parseError instanceof Error
                ? parseError.message
                : String(parseError),
          });
        }
      }

      if (
        req.uploadedProductUrls &&
        req.uploadedProductUrls.length > 0 &&
        req.body.produits
      ) {
        // Handle single product (take first element if array, or use directly)
        const produitsArray = Array.isArray(req.body.produits) 
          ? req.body.produits 
          : [req.body.produits];
        
        req.body.produits = produitsArray.map(
          (produit: any, index: number) => ({
            ...produit,
            imageUrl: req.uploadedProductUrls[index] || produit.imageUrl,
          })
        );
      }

      // Parse date fields to ensure they are Date objects
      if (req.body.date_debut) {
        req.body.date_debut = new Date(req.body.date_debut);
      }
      if (req.body.date_fin) {
        req.body.date_fin = new Date(req.body.date_fin);
      }
      if (req.body.date_affiche) {
        req.body.date_affiche = new Date(req.body.date_affiche);
      }
      if (req.body.date_affiche_fin) {
        req.body.date_affiche_fin = new Date(req.body.date_affiche_fin);
      }

      const promotion = await promotionService.createPromotion(req.body);
      handleResponse(res, promotion);
    } catch (error: any) {
      handleError(res, error);
    }
  }
);
PromotionController.put(
  `/:id`,
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const promotion = await promotionService.updatePromotion(
        req.params.id,
        req.body
      );
      handleResponse(res, promotion);
    } catch (error: any) {
      handleError(res, error);
    }
  }
);

PromotionController.delete(
  `/:id`,
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const promotion = await promotionService.deletePromotion(req.params.id);
      handleResponse(res, promotion);
    } catch (error: any) {
      handleError(res, error);
    }
  }
);

PromotionController.post(
  "/:id",
  uploadPromotionWithProductImagesUpdate(), // Still use the upload middleware
  async (req: any, res: any) => {
    try {
      const promotionId = req.params.id;
      req.body = req.body || {};

      // Parse existingAfficheUrls first
      let existingAfficheUrls: string[] = [];
      if (req.body.existingAfficheUrls) {
        try {
          existingAfficheUrls =
            typeof req.body.existingAfficheUrls === "string"
              ? JSON.parse(req.body.existingAfficheUrls)
              : req.body.existingAfficheUrls;
        } catch (e) {
          console.error("Error parsing existingAfficheUrls:", e);
        }
      }

      // Combine existing and new affiche URLs
      const newAfficheUrls = req.uploadedPromotionUrls || [];
      const allAfficheUrls = [...existingAfficheUrls, ...newAfficheUrls];

      const uniqueAfficheUrls = Array.from(new Set(allAfficheUrls));
      // Validate we have at least one image (either existing or new)
      if (uniqueAfficheUrls.length === 0) {
        return res.status(400).json({
          message:
            "At least one promotion image is required (either existing or new)",
        });
      }

      // Parse produits if it's a string
      if (typeof req.body.produits === "string") {
        try {
          req.body.produits = JSON.parse(req.body.produits);
        } catch (parseError) {
          return res.status(400).json({
            message: "Invalid JSON format for produits field",
            error:
              parseError instanceof Error
                ? parseError.message
                : String(parseError),
          });
        }
      }

      // Handle product images if any were uploaded
      if (req.uploadedProductUrls && req.uploadedProductUrls.length > 0) {
        if (!req.body.produits) {
          return res.status(400).json({
            message: "Product images uploaded but no products data provided",
          });
        }

        // Handle single product (take first element if array, or use directly)
        const produits = Array.isArray(req.body.produits)
          ? req.body.produits
          : [req.body.produits];

        req.body.produits = produits.map((produit: any, index: number) => ({
          ...produit,
          imageUrl: req.uploadedProductUrls[index] || produit.imageUrl,
        }));
      }

      // Parse date fields to ensure they are Date objects
      if (req.body.date_debut) {
        req.body.date_debut = new Date(req.body.date_debut);
      }
      if (req.body.date_fin) {
        req.body.date_fin = new Date(req.body.date_fin);
      }
      if (req.body.date_affiche) {
        req.body.date_affiche = new Date(req.body.date_affiche);
      }
      if (req.body.date_affiche_fin) {
        req.body.date_affiche_fin = new Date(req.body.date_affiche_fin);
      }

      // Prepare the update data
      const updateData = {
        ...req.body,
        afficheUrls: uniqueAfficheUrls, // Use the combined list
        existingAfficheUrls, // Pass this separately for cleanup
      };

      const promotion = await promotionService.updatePromotion(
        promotionId,
        updateData
      );

      return res.status(200).json({
        success: true,
        data: promotion,
      });
    } catch (error: any) {
      console.error("Error updating promotion:", error);
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || "Failed to update promotion",
      });
    }
  }
);

export default PromotionController;
