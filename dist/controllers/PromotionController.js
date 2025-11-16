"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const PromotionService_1 = require("../services/PromotionService");
const middleware_1 = require("../middleware/middleware");
const responseHandler_1 = require("../utils/responseHandler");
const upload_1 = require("../middleware/upload");
const PromotionController = express_1.default.Router();
PromotionController.get(`/`, async (req, res) => {
    try {
        const promotions = await PromotionService_1.promotionService.getAllPromotions();
        (0, responseHandler_1.handleResponse)(res, promotions);
    }
    catch (error) {
        (0, responseHandler_1.handleError)(res, error);
    }
});
PromotionController.get(`/:id`, async (req, res) => {
    try {
        const promotion = await PromotionService_1.promotionService.getPromotionById(req.params.id);
        (0, responseHandler_1.handleResponse)(res, promotion);
    }
    catch (error) {
        (0, responseHandler_1.handleError)(res, error);
    }
});
// Get promotions by fournisseur ID
PromotionController.get("/fournisseur/:fournisseurId", async (req, res) => {
    if (!req.params.fournisseurId) {
        return res.status(400).json({ message: "Fournisseur ID is required." });
    }
    try {
        const promotions = await PromotionService_1.promotionService.getPromotionsByFournisseur(req.params.fournisseurId);
        (0, responseHandler_1.handleResponse)(res, promotions);
    }
    catch (error) {
        (0, responseHandler_1.handleError)(res, error);
    }
});
PromotionController.post("/", (0, upload_1.uploadPromotionWithProductImagesUpdate)(), async (req, res) => {
    try {
        if (req.uploadedPromotionUrls && req.uploadedPromotionUrls.length > 0) {
            req.body.afficheUrls = req.uploadedPromotionUrls;
        }
        if (typeof req.body.produits === "string") {
            try {
                req.body.produits = JSON.parse(req.body.produits);
            }
            catch (parseError) {
                return res.status(400).json({
                    message: "Invalid JSON format for produits field",
                    error: parseError instanceof Error
                        ? parseError.message
                        : String(parseError),
                });
            }
        }
        if (req.uploadedProductUrls &&
            req.uploadedProductUrls.length > 0 &&
            req.body.produits) {
            req.body.produits = req.body.produits.map((produit, index) => ({
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
        const promotion = await PromotionService_1.promotionService.createPromotion(req.body);
        (0, responseHandler_1.handleResponse)(res, promotion);
    }
    catch (error) {
        (0, responseHandler_1.handleError)(res, error);
    }
});
PromotionController.put(`/:id`, middleware_1.verifyToken, async (req, res) => {
    try {
        const promotion = await PromotionService_1.promotionService.updatePromotion(req.params.id, req.body);
        (0, responseHandler_1.handleResponse)(res, promotion);
    }
    catch (error) {
        (0, responseHandler_1.handleError)(res, error);
    }
});
PromotionController.delete(`/:id`, middleware_1.verifyToken, async (req, res) => {
    try {
        const promotion = await PromotionService_1.promotionService.deletePromotion(req.params.id);
        (0, responseHandler_1.handleResponse)(res, promotion);
    }
    catch (error) {
        (0, responseHandler_1.handleError)(res, error);
    }
});
PromotionController.post("/:id", (0, upload_1.uploadPromotionWithProductImagesUpdate)(), // Still use the upload middleware
async (req, res) => {
    try {
        const promotionId = req.params.id;
        req.body = req.body || {};
        // Parse existingAfficheUrls first
        let existingAfficheUrls = [];
        if (req.body.existingAfficheUrls) {
            try {
                existingAfficheUrls =
                    typeof req.body.existingAfficheUrls === "string"
                        ? JSON.parse(req.body.existingAfficheUrls)
                        : req.body.existingAfficheUrls;
            }
            catch (e) {
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
                message: "At least one promotion image is required (either existing or new)",
            });
        }
        // Parse produits if it's a string
        if (typeof req.body.produits === "string") {
            try {
                req.body.produits = JSON.parse(req.body.produits);
            }
            catch (parseError) {
                return res.status(400).json({
                    message: "Invalid JSON format for produits field",
                    error: parseError instanceof Error
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
            const produits = Array.isArray(req.body.produits)
                ? req.body.produits
                : [req.body.produits];
            req.body.produits = produits.map((produit, index) => ({
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
        const promotion = await PromotionService_1.promotionService.updatePromotion(promotionId, updateData);
        return res.status(200).json({
            success: true,
            data: promotion,
        });
    }
    catch (error) {
        console.error("Error updating promotion:", error);
        return res.status(error.status || 500).json({
            success: false,
            message: error.message || "Failed to update promotion",
        });
    }
});
exports.default = PromotionController;
//# sourceMappingURL=PromotionController.js.map