const Produit = require('../entities/Produit');
const Category = require('../entities/Category');
const Fournisseur = require('../entities/Fournisseur');
const { Types } = require('mongoose');
const ServiceError = require('../bean/ErrorResponse');


const produitService = {
    getAllProduits: async () => {
        try {
            const produits = await Produit.find()
                .populate('category', 'nom')
                .populate('fournisseur', 'nom');
            
            if (!produits || produits.length === 0) {
                throw new ServiceError('No products found', 404);
            }
            
            return { 
                success: true, 
                data: produits,
                count: produits.length
            };
        } catch (error) {
            if (error instanceof ServiceError) throw error;
            throw new ServiceError(`Failed to fetch products: ${error.message}`, 500);
        }
    },

    getProduitById: async (id) => {
        try {
            if (!Types.ObjectId.isValid(id)) {
                throw new ServiceError('Invalid product ID format', 400);
            }

            const produit = await Produit.findById(id)
                .populate('category', 'nom')
                .populate('fournisseur', 'nom');
                
            if (!produit) {
                throw new ServiceError('Product not found', 404);
            }
            
            return { 
                success: true, 
                data: produit 
            };
        } catch (error) {
            if (error instanceof ServiceError) throw error;
            throw new ServiceError(`Failed to fetch product: ${error.message}`, 500);
        }
    },

    createProduit: async (produitData) => {
        try {
            // Validate required fields
            if (!produitData.nom || !produitData.prix || !produitData.category || !produitData.fournisseur) {
                throw new ServiceError('Name, price, category and supplier are required', 400);
            }

            // Validate category exists
            const categoryExists = await Category.findById(produitData.category);
            if (!categoryExists) {
                throw new ServiceError('Category not found', 404);
            }

            // Validate supplier exists
            const fournisseurExists = await Fournisseur.findById(produitData.fournisseur);
            if (!fournisseurExists) {
                throw new ServiceError('Supplier not found', 404);
            }

            const produit = new Produit(produitData);
            await produit.save();
            
            return { 
                success: true, 
                statusCode: 201,
                message: 'Product created successfully',
                data: produit 
            };
        } catch (error) {
            if (error instanceof ServiceError) throw error;
            throw new ServiceError(`Product creation failed: ${error.message}`, 500);
        }
    },

    updateProduit: async (id, produitData) => {
        try {
            if (!Types.ObjectId.isValid(id)) {
                throw new ServiceError('Invalid product ID format', 400);
            }

            // Prevent certain fields from being updated directly
            if (produitData.views) {
                throw new ServiceError('Views cannot be updated directly', 400);
            }

            const produit = await Produit.findByIdAndUpdate(id, produitData, { 
                new: true,
                runValidators: true 
            })
            .populate('category', 'nom')
            .populate('fournisseur', 'nom');
            
            if (!produit) {
                throw new ServiceError('Product not found', 404);
            }
            
            return { 
                success: true, 
                message: 'Product updated successfully',
                data: produit 
            };
        } catch (error) {
            if (error instanceof ServiceError) throw error;
            throw new ServiceError(`Product update failed: ${error.message}`, 500);
        }
    },

    deleteProduit: async (id) => {
        try {
            if (!Types.ObjectId.isValid(id)) {
                throw new ServiceError('Invalid product ID format', 400);
            }

            const produit = await Produit.findByIdAndDelete(id);
            if (!produit) {
                throw new ServiceError('Product not found', 404);
            }
            
            return { 
                success: true, 
                message: 'Product deleted successfully',
                data: { productId: id }
            };
        } catch (error) {
            if (error instanceof ServiceError) throw error;
            throw new ServiceError(`Product deletion failed: ${error.message}`, 500);
        }
    },

    searchByCriteria: async (criteria = {}) => {
        try {
            const query = {};
            
            // Price range validation
            if (typeof criteria.priceMin !== 'undefined') {
                const priceMin = Number(criteria.priceMin);
                if (isNaN(priceMin)) {
                    throw new ServiceError('Invalid minimum price value', 400);
                }
                query.prix = query.prix || {};
                query.prix.$gte = priceMin;
            }
            
            if (typeof criteria.priceMax !== 'undefined') {
                const priceMax = Number(criteria.priceMax);
                if (isNaN(priceMax)) {
                    throw new ServiceError('Invalid maximum price value', 400);
                }
                query.prix = query.prix || {};
                query.prix.$lte = priceMax;
            }
            
            // Validate price range if both are provided
            if (query.prix?.$gte && query.prix?.$lte && query.prix.$gte > query.prix.$lte) {
                throw new ServiceError('Minimum price cannot be greater than maximum price', 400);
            }

            // Category search
            let category = {};
            if (typeof criteria.category !== 'undefined') {
                const categories = await Category.find({ 
                    nom: { $regex: criteria.category, $options: 'i' } 
                });
                
                if (!categories || categories.length === 0) {
                    throw new ServiceError('No matching categories found', 404);
                }
                
                category = { category: { $in: categories.map(c => c._id) } };
            }

            // Supplier search
            let fournisseur = {};
            if (typeof criteria.fournisseur !== 'undefined') {
                const fournisseurs = await Fournisseur.find({ 
                    nom: { $regex: criteria.fournisseur, $options: 'i' } 
                });
                
                if (!fournisseurs || fournisseurs.length === 0) {
                    throw new ServiceError('No matching suppliers found', 404);
                }
                
                fournisseur = { fournisseur: { $in: fournisseurs.map(c => c._id) } };
            }

            // Status filter
            if (typeof criteria.status !== 'undefined') {
                if (!['disponible', 'indisponible', 'en rupture'].includes(criteria.status)) {
                    throw new ServiceError('Invalid status value', 400);
                }
                query.status = criteria.status;
            }
            
            // Verified filter
            if (typeof criteria.verified !== 'undefined') {
                query.verified = criteria.verified === 'true';
            }
            
            // Name search
            if (typeof criteria.nom !== 'undefined') {
                if (criteria.nom.length < 2) {
                    throw new ServiceError('Search term must be at least 2 characters', 400);
                }
                query.nom = { $regex: criteria.nom, $options: 'i' }; 
            }

            const produits = await Produit.find({ ...query, ...category, ...fournisseur })
                .populate({
                    path: 'category',
                    select: 'nom' 
                })  
                .populate('fournisseur');
            
            if (!produits || produits.length === 0) {
                throw new ServiceError('No products matching the criteria', 404);
            }
            
            return { 
                success: true, 
                data: produits,
                count: produits.length
            };
        } catch (error) {
            if (error instanceof ServiceError) throw error;
            throw new ServiceError(`Product search failed: ${error.message}`, 500);
        }
    },

    getProductsByCategory: async (categoryId, limit = 10) => {
        try {
            if (!Types.ObjectId.isValid(categoryId)) {
                throw new ServiceError('Invalid category ID format', 400);
            }

            const categoryExists = await Category.findById(categoryId);
            if (!categoryExists) {
                throw new ServiceError('Category not found', 404);
            }

            const produits = await Produit.find({ 
                category: categoryId,  
            })
            .sort({ 'promotion.pourcentage': -1 })
            .limit(Number(limit))
            .populate('category', 'nom')
            .populate('fournisseur', 'nom');
            
            if (!produits || produits.length === 0) {
                throw new ServiceError('No products found in this category', 404);
            }
            
            return { 
                success: true, 
                data: produits,
                count: produits.length
            };
        } catch (error) {
            if (error instanceof ServiceError) throw error;
            throw new ServiceError(`Failed to get products by category: ${error.message}`, 500);
        }
    },

    getPopularProducts: async (limit = 10) => {
        try {
            const produits = await Produit.find()
                .sort({ views: -1 })
                .limit(Number(limit))
                .populate('category', 'nom')
                .populate('fournisseur', 'nom');
                
            if (!produits || produits.length === 0) {
                throw new ServiceError('No popular products found', 404);
            }
            
            return { 
                success: true, 
                data: produits,
                count: produits.length
            };
        } catch (error) {
            if (error instanceof ServiceError) throw error;
            throw new ServiceError(`Failed to get popular products: ${error.message}`, 500);
        }
    },

    getProductsByFournisseur: async (fournisseurId) => {
        try {
            if (!Types.ObjectId.isValid(fournisseurId)) {
                throw new ServiceError('Invalid supplier ID format', 400);
            }

            const fournisseurExists = await Fournisseur.findById(fournisseurId);
            if (!fournisseurExists) {
                throw new ServiceError('Supplier not found', 404);
            }

            const produits = await Produit.find({ 
                fournisseur: fournisseurId,
            })
            .populate('category', 'nom');
            
            if (!produits || produits.length === 0) {
                throw new ServiceError('No products found for this supplier', 404);
            }
            
            return { 
                success: true, 
                data: produits,
                count: produits.length
            };
        } catch (error) {
            if (error instanceof ServiceError) throw error;
            throw new ServiceError(`Failed to get products by supplier: ${error.message}`, 500);
        }
    },

    incrementProductViews: async (productId) => {
        try {
            if (!Types.ObjectId.isValid(productId)) {
                throw new ServiceError('Invalid product ID format', 400);
            }

            const produit = await Produit.findByIdAndUpdate(
                productId,
                { $inc: { views: 1 } },
                { new: true }
            )
            .populate('category', 'nom')
            .populate('fournisseur', 'nom');
            
            if (!produit) {
                throw new ServiceError('Product not found', 404);
            }
            
            return { 
                success: true, 
                message: 'Product views incremented',
                data: produit 
            };
        } catch (error) {
            if (error instanceof ServiceError) throw error;
            throw new ServiceError(`Failed to increment product views: ${error.message}`, 500);
        }
    },

    getBestDiscounts: async (limit = 10) => {
        try {
            const produits = await Produit.find({
                'promotion.pourcentage': { $exists: true, $gt: 0 }
            })
            .sort({ 'promotion.pourcentage': -1 })
            .limit(Number(limit))
            .populate('category', 'nom')
            .populate('fournisseur', 'nom');
            
            if (!produits || produits.length === 0) {
                throw new ServiceError('No discounted products found', 404);
            }
            
            return { 
                success: true, 
                data: produits,
                count: produits.length
            };
        } catch (error) {
            if (error instanceof ServiceError) throw error;
            throw new ServiceError(`Failed to get discounted products: ${error.message}`, 500);
        }
    },

    getCurrentPromotions: async () => {
        try {
            const now = new Date();
            const produits = await Produit.find({
                'promotion.date_debut': { $lte: now },
                'promotion.date_fin': { $gte: now },
                status: 'disponible'
            })
            .sort({ 'promotion.pourcentage': -1 })
            .limit(10)
            .populate('category', 'nom')
            .populate('fournisseur', 'nom');
            
            if (!produits || produits.length === 0) {
                throw new ServiceError('No current promotions available', 404);
            }
            
            return { 
                success: true, 
                data: produits,
                count: produits.length
            };
        } catch (error) {
            if (error instanceof ServiceError) throw error;
            throw new ServiceError(`Failed to get current promotions: ${error.message}`, 500);
        }
    }
};

module.exports = produitService;