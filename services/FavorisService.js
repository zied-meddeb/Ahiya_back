const Favoris = require('../entities/Favoris');
const { Types } = require('mongoose');
const ServiceError = require('../bean/ErrorResponse');


const FavorisService = {
    // Add to favorites or remove if already exists (toggle)
    addFavorite: async (userId, productId) => {
        try {
            if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(productId)) {
                throw new ServiceError('Invalid user ID or product ID format', 400);
            }

            const exists = await Favoris.findOne({ userId, produitId: productId });
            
            if (exists) {
                const removed = await Favoris.findOneAndDelete({ userId, produitId: productId });
                return {
                    success: true,
                    message: 'Product removed from favorites',
                    data: { 
                        isFavorited: false,
                        favoriteId: removed._id 
                    }
                };
            }
            
            const favorite = new Favoris({ userId, produitId: productId });
            await favorite.save();
            
            return {
                success: true,
                statusCode: 201,
                message: 'Product added to favorites',
                data: { 
                    isFavorited: true,
                    favoriteId: favorite._id 
                }
            };
        } catch (error) {
            if (error instanceof ServiceError) throw error;
            throw new ServiceError(`Failed to toggle favorite: ${error.message}`, 500);
        }
    },

    // Remove from favorites
    removeFavorite: async (userId, productId) => {
        try {
            if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(productId)) {
                throw new ServiceError('Invalid user ID or product ID format', 400);
            }

            const result = await Favoris.findOneAndDelete({ userId, produitId: productId });
            
            if (!result) {
                throw new ServiceError('Favorite not found', 404);
            }
            
            return {
                success: true,
                message: 'Product removed from favorites',
                data: { 
                    favoriteId: result._id 
                }
            };
        } catch (error) {
            if (error instanceof ServiceError) throw error;
            throw new ServiceError(`Failed to remove favorite: ${error.message}`, 500);
        }
    },

    // Check if product is favorited
    isFavorited: async (userId, productId) => {
        try {
            if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(productId)) {
                throw new ServiceError('Invalid user ID or product ID format', 400);
            }

            const fav = await Favoris.findOne({ userId, produitId: productId });
            
            return {
                success: true,
                data: { 
                    isFavorited: !!fav,
                    ...(fav && { favoriteId: fav._id })
                }
            };
        } catch (error) {
            if (error instanceof ServiceError) throw error;
            throw new ServiceError(`Failed to check favorite status: ${error.message}`, 500);
        }
    },

    // Get user's favorites
    getUserFavorites: async (userId) => {
        try {
            if (!Types.ObjectId.isValid(userId)) {
                throw new ServiceError('Invalid user ID format', 400);
            }

            const favorites = await Favoris.find({ userId })
                .populate({
                    path: 'produitId',
                    select: 'nom description prix old_prix imageUrl promotion',
                    populate: {
                        path: 'fournisseur', 
                        model: 'fournisseur',
                        select: 'nom'
                    }
                });
            
            if (!favorites || favorites.length === 0) {
                return {
                    success: true,
                    message: 'No favorites found for this user',
                    data: [],
                    count: 0
                };
            }
            
            const formattedFavorites = favorites.map(fav => ({
                id: fav._id,
                produit: fav.produitId
            }));
            
            return {
                success: true,
                data: formattedFavorites,
                count: formattedFavorites.length
            };
        } catch (error) {
            if (error instanceof ServiceError) throw error;
            throw new ServiceError(`Failed to get user favorites: ${error.message}`, 500);
        }
    }
};

module.exports = FavorisService;