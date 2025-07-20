import { Types } from 'mongoose';
import { IFavoris,Favoris } from '../entities/Favoris';
import { ServiceError } from '../utils/ErrorResponse';
import { IProduit } from '../entities/Produit';

interface FavorisResponse {
    success: boolean;
    statusCode?: number;
    message?: string;
    data?: any;
    count?: number;
}

export const FavorisService = {
    addFavorite: async (userId: string, productId: string): Promise<FavorisResponse> => {
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
                        favoriteId: removed?._id 
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
        } catch (error:any) {
            if (error instanceof ServiceError) throw error;
            throw new ServiceError(`Failed to toggle favorite: ${error.message}`, 500);
        }
    },

    removeFavorite: async (userId: string, productId: string): Promise<FavorisResponse> => {
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
        } catch (error:any) {
            if (error instanceof ServiceError) throw error;
            throw new ServiceError(`Failed to remove favorite: ${error.message}`, 500);
        }
    },

    isFavorited: async (userId: string, productId: string): Promise<FavorisResponse> => {
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
        } catch (error:any) {
            if (error instanceof ServiceError) throw error;
            throw new ServiceError(`Failed to check favorite status: ${error.message}`, 500);
        }
    },

    getUserFavorites: async (userId: string): Promise<FavorisResponse> => {
        try {
            if (!Types.ObjectId.isValid(userId)) {
                throw new ServiceError('Invalid user ID format', 400);
            }

            const favorites = await Favoris.find({ userId })
                .populate<{ produitId: IProduit }>({
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
        } catch (error:any) {
            if (error instanceof ServiceError) throw error;
            throw new ServiceError(`Failed to get user favorites: ${error.message}`, 500);
        }
    }
};