const Promotion = require('../entities/Promotion');

const promotionService = {
    getAllPromotions: async () => {
        try {
            const promotions = await Promotion.find();
            return promotions;
        } catch (error) {
            throw new Error(error.message);
        }
    },

    getPromotionById: async (id) => {
        try {
            const promotion = await Promotion.findById(id);
            if (!promotion) {
                throw new Error('Promotion not found');
            }
            return promotion;
        } catch (error) {
            throw new Error(error.message);
        }
    },

    createPromotion: async (promotionData) => {
        try {
            const promotion = new Promotion(promotionData);
            await promotion.save();
            return promotion;
        } catch (error) {
            throw new Error( error.message);
        }
    },

    updatePromotion: async (id, promotionData) => {
        try {
            const promotion = await Promotion.findByIdAndUpdate(id, promotionData, { new: true });
            if (!promotion) {
                throw new Error('Promotion not found');
            }
            return promotion;
        } catch (error) {
            throw new Error( error.message);
        }
    },

    deletePromotion: async (id) => {
        try {
            const promotion = await Promotion.findByIdAndDelete(id);
            if (!promotion) {
                throw new Error('Promotion not found');
            }
            return promotion;
        } catch (error) {
            throw new Error(error.message);
        }
    },
};
module.exports = promotionService;