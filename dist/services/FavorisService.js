"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FavorisService = void 0;
const mongoose_1 = require("mongoose");
const Favoris_1 = require("../entities/Favoris");
const ErrorResponse_1 = require("../utils/ErrorResponse");
exports.FavorisService = {
    addFavorite: async (userId, productId) => {
        try {
            if (!mongoose_1.Types.ObjectId.isValid(userId) || !mongoose_1.Types.ObjectId.isValid(productId)) {
                throw new ErrorResponse_1.ServiceError('Invalid user ID or product ID format', 400);
            }
            const exists = await Favoris_1.Favoris.findOne({ userId, produitId: productId });
            if (exists) {
                const removed = await Favoris_1.Favoris.findOneAndDelete({ userId, produitId: productId });
                return {
                    success: true,
                    message: 'Product removed from favorites',
                    data: {
                        isFavorited: false,
                        favoriteId: removed?._id
                    }
                };
            }
            const favorite = new Favoris_1.Favoris({ userId, produitId: productId });
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
        }
        catch (error) {
            if (error instanceof ErrorResponse_1.ServiceError)
                throw error;
            throw new ErrorResponse_1.ServiceError(`Failed to toggle favorite: ${error.message}`, 500);
        }
    },
    removeFavorite: async (userId, productId) => {
        try {
            if (!mongoose_1.Types.ObjectId.isValid(userId) || !mongoose_1.Types.ObjectId.isValid(productId)) {
                throw new ErrorResponse_1.ServiceError('Invalid user ID or product ID format', 400);
            }
            const result = await Favoris_1.Favoris.findOneAndDelete({ userId, produitId: productId });
            if (!result) {
                throw new ErrorResponse_1.ServiceError('Favorite not found', 404);
            }
            return {
                success: true,
                message: 'Product removed from favorites',
                data: {
                    favoriteId: result._id
                }
            };
        }
        catch (error) {
            if (error instanceof ErrorResponse_1.ServiceError)
                throw error;
            throw new ErrorResponse_1.ServiceError(`Failed to remove favorite: ${error.message}`, 500);
        }
    },
    isFavorited: async (userId, productId) => {
        try {
            if (!mongoose_1.Types.ObjectId.isValid(userId) || !mongoose_1.Types.ObjectId.isValid(productId)) {
                throw new ErrorResponse_1.ServiceError('Invalid user ID or product ID format', 400);
            }
            const fav = await Favoris_1.Favoris.findOne({ userId, produitId: productId });
            return {
                success: true,
                data: {
                    isFavorited: !!fav,
                    ...(fav && { favoriteId: fav._id })
                }
            };
        }
        catch (error) {
            if (error instanceof ErrorResponse_1.ServiceError)
                throw error;
            throw new ErrorResponse_1.ServiceError(`Failed to check favorite status: ${error.message}`, 500);
        }
    },
    getUserFavorites: async (userId) => {
        try {
            if (!mongoose_1.Types.ObjectId.isValid(userId)) {
                throw new ErrorResponse_1.ServiceError('Invalid user ID format', 400);
            }
            const favorites = await Favoris_1.Favoris.find({ userId })
                .populate({
                path: 'produitId',
                select: 'nom description prix prix_original prix_offre imageUrl promotion',
                populate: {
                    path: 'fournisseur',
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
        }
        catch (error) {
            if (error instanceof ErrorResponse_1.ServiceError)
                throw error;
            throw new ErrorResponse_1.ServiceError(`Failed to get user favorites: ${error.message}`, 500);
        }
    }
};
//# sourceMappingURL=FavorisService.js.map