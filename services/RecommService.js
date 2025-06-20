const Recommendation = require('../entities/Recommendation');
const User = require('../entities/User');
const Product = require('../entities/Produit');
const { Types } = require('mongoose');
const ServiceError = require('../bean/ErrorResponse');

const recommendationService = {
    // Generate and store recommendations
    generateRecommendations: async (userId) => {
        try {
            if (!Types.ObjectId.isValid(userId)) {
                throw new ServiceError('Invalid user ID format', 400);
            }

            const user = await User.findById(userId)
                .select('favoriteCategories')
                .lean();
            
            if (!user) {
                throw new ServiceError('User not found', 404);
            }

            // Content-based recommendations (based on favorite categories)
            let contentBased = [];
            if (user.favoriteCategories && user.favoriteCategories.length > 0) {
                contentBased = await Product.find({
                    category: { $in: user.favoriteCategories },
                    status: 'disponible'
                })
                .sort({ 
                    'promotion.pourcentage': -1,
                    views: -1 
                })
                .limit(15)
                .lean();
            }

            // Popular products (fallback)
            const popular = await Product.find({
                _id: { $nin: contentBased.map(p => p._id) },
                status: 'disponible'
            })
            .sort({ 
                views: -1,
                'promotion.pourcentage': -1
            })
            .limit(15)
            .lean();

            // Calculate scores
            const recommendations = [...contentBased, ...popular].map(p => ({
                product: p._id,
                score: user.favoriteCategories?.includes(p.category.toString()) ? 0.8 : 0.5,
                lastUpdated: new Date()
            }));

            // Store recommendations
            const result = await Recommendation.findOneAndUpdate(
                { userId },
                { 
                    userId,
                    recommendedProducts: recommendations,
                    lastGenerated: new Date()
                },
                { 
                    upsert: true, 
                    new: true,
                    setDefaultsOnInsert: true 
                }
            ).populate({
                path: 'recommendedProducts.product',
                select: 'nom description prix old_prix imageUrl promotion category',
                populate: {
                    path: 'category',
                    select: 'nom'
                }
            });

            return {
                success: true,
                data: {
                    recommendations: result.recommendedProducts
                        .sort((a, b) => b.score - a.score),
                    generatedAt: result.lastGenerated
                }
            };
        } catch (error) {
            if (error instanceof ServiceError) throw error;
            throw new ServiceError(`Recommendation generation failed: ${error.message}`, 500);
        }
    },

    // Get stored recommendations
    getRecommendations: async (userId, limit = 10) => {
        try {
            if (!Types.ObjectId.isValid(userId)) {
                throw new ServiceError('Invalid user ID format', 400);
            }

            limit = Math.min(Number(limit) || 10, 20); // Cap at 20 recommendations

            // Check for existing recent recommendations
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

            const existingRecs = await Recommendation.findOne({
                userId,
                lastGenerated: { $gte: oneWeekAgo }
            })
            .populate({
                path: 'recommendedProducts.product',
                select: 'nom description prix old_prix imageUrl promotion category',
                populate: {
                    path: 'category',
                    select: 'nom'
                },
                options: { limit }
            });

            if (existingRecs) {
                return {
                    success: true,
                    data: {
                        recommendations: existingRecs.recommendedProducts
                            .sort((a, b) => b.score - a.score)
                            .slice(0, limit),
                        generatedAt: existingRecs.lastGenerated,
                        source: 'cached'
                    }
                };
            }

            // Generate new recommendations if none exist or they're stale
            const response = await recommendationService.generateRecommendations(userId);
            return {
                ...response,
                data: {
                    ...response.data,
                    recommendations: response.data.recommendations.slice(0, limit),
                    source: 'new'
                }
            };
        } catch (error) {
            if (error instanceof ServiceError) throw error;
            throw new ServiceError(`Failed to get recommendations: ${error.message}`, 500);
        }
    },

    // Update recommendation score (when user interacts with recommended product)
    updateRecommendationScore: async (userId, productId, increment = 0.1) => {
        try {
            if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(productId)) {
                throw new ServiceError('Invalid user ID or product ID format', 400);
            }

            increment = Math.min(Math.max(Number(increment), 0), 1); // Clamp between 0-1

            const updatedRec = await Recommendation.findOneAndUpdate(
                { 
                    userId,
                    'recommendedProducts.product': productId
                },
                { 
                    $inc: { 'recommendedProducts.$.score': increment },
                    $set: { 'recommendedProducts.$.lastUpdated': new Date() }
                },
                { 
                    new: true 
                }
            ).populate({
                path: 'recommendedProducts.product',
                select: 'nom description prix old_prix imageUrl promotion category',
                populate: {
                    path: 'category',
                    select: 'nom'
                }
            });

            if (!updatedRec) {
                throw new ServiceError('Recommendation not found', 404);
            }

            const updatedProduct = updatedRec.recommendedProducts.find(
                p => p.product._id.toString() === productId.toString()
            );

            return {
                success: true,
                message: 'Recommendation score updated',
                data: {
                    product: updatedProduct.product,
                    newScore: updatedProduct.score
                }
            };
        } catch (error) {
            if (error instanceof ServiceError) throw error;
            throw new ServiceError(`Failed to update recommendation score: ${error.message}`, 500);
        }
    }
};

module.exports = recommendationService;