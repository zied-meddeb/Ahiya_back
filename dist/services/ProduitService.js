"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.produitService = void 0;
const mongoose_1 = require("mongoose");
const Produit_1 = require("../entities/Produit");
const Category_1 = require("../entities/Category");
const Fournisseur_1 = require("../entities/Fournisseur");
const ErrorResponse_1 = require("../utils/ErrorResponse");
exports.produitService = {
    getAllProduits: async () => {
        try {
            const produits = await Produit_1.Produit.find()
                .populate("category", "nom")
                .populate("fournisseur", "nom");
            if (!produits || produits.length === 0) {
                throw new ErrorResponse_1.ServiceError("No products found", 404);
            }
            return {
                success: true,
                data: produits,
                count: produits.length,
            };
        }
        catch (error) {
            if (error instanceof ErrorResponse_1.ServiceError)
                throw error;
            throw new ErrorResponse_1.ServiceError(`Failed to fetch products: ${error.message}`, 500);
        }
    },
    getProduitById: async (id) => {
        try {
            if (!mongoose_1.Types.ObjectId.isValid(id)) {
                throw new ErrorResponse_1.ServiceError("Invalid product ID format", 400);
            }
            const produit = await Produit_1.Produit.findById(id)
                .populate("category", "nom")
                .populate("fournisseur", "nom");
            if (!produit) {
                throw new ErrorResponse_1.ServiceError("Product not found", 404);
            }
            return {
                success: true,
                data: produit,
            };
        }
        catch (error) {
            if (error instanceof ErrorResponse_1.ServiceError)
                throw error;
            throw new ErrorResponse_1.ServiceError(`Failed to fetch product: ${error.message}`, 500);
        }
    },
    createProduit: async (produitData) => {
        try {
            const categoryExists = await Category_1.Category.findById(produitData.category);
            if (!categoryExists) {
                throw new ErrorResponse_1.ServiceError("Category not found", 404);
            }
            const fournisseurExists = await Fournisseur_1.Fournisseur.findById(produitData.fournisseur);
            if (!fournisseurExists) {
                throw new ErrorResponse_1.ServiceError("Supplier not found", 404);
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
                prix: produitData.prix,
            };
            const produit = new Produit_1.Produit(mappedProduitData);
            await produit.save();
            return {
                success: true,
                message: "Product created successfully",
                data: produit,
            };
        }
        catch (error) {
            console.error("Product creation error:", error);
            if (error instanceof ErrorResponse_1.ServiceError)
                throw error;
            throw new ErrorResponse_1.ServiceError(`Product creation failed: ${error.message}`, 500);
        }
    },
    updateProduit: async (id, produitData) => {
        try {
            if (!mongoose_1.Types.ObjectId.isValid(id)) {
                throw new ErrorResponse_1.ServiceError("Invalid product ID format", 400);
            }
            if (produitData.views) {
                throw new ErrorResponse_1.ServiceError("Views cannot be updated directly", 400);
            }
            const produit = await Produit_1.Produit.findByIdAndUpdate(id, produitData, {
                new: true,
                runValidators: true,
            })
                .populate("category", "nom")
                .populate("fournisseur", "nom");
            if (!produit) {
                throw new ErrorResponse_1.ServiceError("Product not found", 404);
            }
            return {
                success: true,
                message: "Product updated successfully",
                data: produit,
            };
        }
        catch (error) {
            if (error instanceof ErrorResponse_1.ServiceError)
                throw error;
            throw new ErrorResponse_1.ServiceError(`Product update failed: ${error.message}`, 500);
        }
    },
    deleteProduit: async (id) => {
        try {
            if (!mongoose_1.Types.ObjectId.isValid(id)) {
                throw new ErrorResponse_1.ServiceError("Invalid product ID format", 400);
            }
            const produit = await Produit_1.Produit.findByIdAndDelete(id);
            if (!produit) {
                throw new ErrorResponse_1.ServiceError("Product not found", 404);
            }
            return {
                success: true,
                message: "Product deleted successfully",
                data: produit,
            };
        }
        catch (error) {
            if (error instanceof ErrorResponse_1.ServiceError)
                throw error;
            throw new ErrorResponse_1.ServiceError(`Product deletion failed: ${error.message}`, 500);
        }
    },
    searchByCriteria: async (criteria = {}) => {
        try {
            const query = {};
            // Price range validation
            if (typeof criteria.priceMin !== "undefined") {
                const priceMin = Number(criteria.priceMin);
                if (isNaN(priceMin)) {
                    throw new ErrorResponse_1.ServiceError("Invalid minimum price value", 400);
                }
                query.prix = query.prix || {};
                query.prix.$gte = priceMin;
            }
            if (typeof criteria.priceMax !== "undefined") {
                const priceMax = Number(criteria.priceMax);
                if (isNaN(priceMax)) {
                    throw new ErrorResponse_1.ServiceError("Invalid maximum price value", 400);
                }
                query.prix = query.prix || {};
                query.prix.$lte = priceMax;
            }
            if (query.prix?.$gte &&
                query.prix?.$lte &&
                query.prix.$gte > query.prix.$lte) {
                throw new ErrorResponse_1.ServiceError("Minimum price cannot be greater than maximum price", 400);
            }
            let category = {};
            if (typeof criteria.category !== "undefined") {
                const categories = await Category_1.Category.find({
                    nom: { $regex: criteria.category, $options: "i" },
                });
                if (!categories || categories.length === 0) {
                    throw new ErrorResponse_1.ServiceError("No matching categories found", 404);
                }
                category = { category: { $in: categories.map((c) => c._id) } };
            }
            let fournisseur = {};
            if (typeof criteria.fournisseur !== "undefined") {
                const fournisseurs = await Fournisseur_1.Fournisseur.find({
                    nom: { $regex: criteria.fournisseur, $options: "i" },
                });
                if (!fournisseurs || fournisseurs.length === 0) {
                    throw new ErrorResponse_1.ServiceError("No matching suppliers found", 404);
                }
                fournisseur = { fournisseur: { $in: fournisseurs.map((c) => c._id) } };
            }
            if (typeof criteria.status !== "undefined") {
                if (!["disponible", "indisponible", "en rupture"].includes(criteria.status)) {
                    throw new ErrorResponse_1.ServiceError("Invalid status value", 400);
                }
                query.status = criteria.status;
            }
            if (typeof criteria.verified !== "undefined") {
                query.verified = criteria.verified === "true";
            }
            if (typeof criteria.nom !== "undefined") {
                query.nom = { $regex: criteria.nom, $options: "i" };
            }
            const produits = await Produit_1.Produit.find({
                ...query,
                ...category,
                ...fournisseur,
            })
                .populate({
                path: "category",
                select: "nom",
            })
                .populate("fournisseur");
            if (!produits || produits.length === 0) {
                throw new ErrorResponse_1.ServiceError("No products matching the criteria", 404);
            }
            return {
                success: true,
                data: produits,
                count: produits.length,
            };
        }
        catch (error) {
            if (error instanceof ErrorResponse_1.ServiceError)
                throw error;
            throw new ErrorResponse_1.ServiceError(`Product search failed: ${error.message}`, 500);
        }
    },
    getProductsByCategory: async (categoryId, limit = 10) => {
        try {
            if (!mongoose_1.Types.ObjectId.isValid(categoryId)) {
                throw new ErrorResponse_1.ServiceError("Invalid category ID format", 400);
            }
            const categoryExists = await Category_1.Category.findById(categoryId);
            if (!categoryExists) {
                throw new ErrorResponse_1.ServiceError("Category not found", 404);
            }
            const produits = await Produit_1.Produit.find({
                category: categoryId,
            })
                .sort({ "promotion.pourcentage": -1 })
                .limit(Number(limit))
                .populate("category", "nom")
                .populate("fournisseur", "nom");
            if (!produits || produits.length === 0) {
                throw new ErrorResponse_1.ServiceError("No products found in this category", 404);
            }
            return {
                success: true,
                data: produits,
                count: produits.length,
            };
        }
        catch (error) {
            if (error instanceof ErrorResponse_1.ServiceError)
                throw error;
            throw new ErrorResponse_1.ServiceError(`Failed to get products by category: ${error.message}`, 500);
        }
    },
    getPopularProducts: async (limit = 10) => {
        try {
            const produits = await Produit_1.Produit.find()
                .sort({ views: -1 })
                .limit(Number(limit))
                .populate("category", "nom")
                .populate("fournisseur", "nom");
            if (!produits || produits.length === 0) {
                throw new ErrorResponse_1.ServiceError("No popular products found", 404);
            }
            return {
                success: true,
                data: produits,
                count: produits.length,
            };
        }
        catch (error) {
            if (error instanceof ErrorResponse_1.ServiceError)
                throw error;
            throw new ErrorResponse_1.ServiceError(`Failed to get popular products: ${error.message}`, 500);
        }
    },
    getProductsByFournisseur: async (fournisseurId) => {
        try {
            if (!mongoose_1.Types.ObjectId.isValid(fournisseurId)) {
                throw new ErrorResponse_1.ServiceError("Invalid supplier ID format", 400);
            }
            const fournisseurExists = await Fournisseur_1.Fournisseur.findById(fournisseurId);
            if (!fournisseurExists) {
                throw new ErrorResponse_1.ServiceError("Supplier not found", 404);
            }
            const produits = await Produit_1.Produit.find({
                fournisseur: fournisseurId,
            }).populate("category", "nom");
            if (!produits || produits.length === 0) {
                throw new ErrorResponse_1.ServiceError("No products found for this supplier", 404);
            }
            return {
                success: true,
                data: produits,
                count: produits.length,
            };
        }
        catch (error) {
            if (error instanceof ErrorResponse_1.ServiceError)
                throw error;
            throw new ErrorResponse_1.ServiceError(`Failed to get products by supplier: ${error.message}`, 500);
        }
    },
    incrementProductViews: async (productId) => {
        try {
            if (!mongoose_1.Types.ObjectId.isValid(productId)) {
                throw new ErrorResponse_1.ServiceError("Invalid product ID format", 400);
            }
            const produit = await Produit_1.Produit.findByIdAndUpdate(productId, { $inc: { views: 1 } }, { new: true })
                .populate("category", "nom")
                .populate("fournisseur", "nom");
            if (!produit) {
                throw new ErrorResponse_1.ServiceError("Product not found", 404);
            }
            return {
                success: true,
                message: "Product views incremented",
                data: produit,
            };
        }
        catch (error) {
            if (error instanceof ErrorResponse_1.ServiceError)
                throw error;
            throw new ErrorResponse_1.ServiceError(`Failed to increment product views: ${error.message}`, 500);
        }
    },
    getBestDiscounts: async (limit = 10) => {
        try {
            const produits = await Produit_1.Produit.find({
                "promotion.pourcentage": { $exists: true, $gt: 0 },
            })
                .sort({ "promotion.pourcentage": -1 })
                .limit(Number(limit))
                .populate("category", "nom")
                .populate("fournisseur", "nom");
            if (!produits || produits.length === 0) {
                throw new ErrorResponse_1.ServiceError("No discounted products found", 404);
            }
            return {
                success: true,
                data: produits,
                count: produits.length,
            };
        }
        catch (error) {
            if (error instanceof ErrorResponse_1.ServiceError)
                throw error;
            throw new ErrorResponse_1.ServiceError(`Failed to get discounted products: ${error.message}`, 500);
        }
    },
    getCurrentPromotions: async () => {
        try {
            const now = new Date();
            const produits = await Produit_1.Produit.find({
                "promotion.date_debut": { $lte: now },
                "promotion.date_fin": { $gte: now },
                status: "disponible",
            })
                .sort({ "promotion.pourcentage": -1 })
                .limit(10)
                .populate("category", "nom")
                .populate("fournisseur", "nom");
            if (!produits || produits.length === 0) {
                throw new ErrorResponse_1.ServiceError("No current promotions available", 404);
            }
            return {
                success: true,
                data: produits,
                count: produits.length,
            };
        }
        catch (error) {
            if (error instanceof ErrorResponse_1.ServiceError)
                throw error;
            throw new ErrorResponse_1.ServiceError(`Failed to get current promotions: ${error.message}`, 500);
        }
    },
};
exports.default = exports.produitService;
//# sourceMappingURL=ProduitService.js.map