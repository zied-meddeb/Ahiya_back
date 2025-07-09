"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.promotionService = void 0;
const Promotion_1 = require("../entities/Promotion");
const ErrorResponse_1 = require("../bean/ErrorResponse");
exports.promotionService = {
    getAllPromotions: async () => {
        try {
            const promotions = await Promotion_1.Promotion.find();
            return { success: true, data: promotions };
        }
        catch (error) {
            throw new ErrorResponse_1.ServiceError(error.message, 500);
        }
    },
    getPromotionById: async (id) => {
        try {
            const promotion = await Promotion_1.Promotion.findById(id);
            if (!promotion) {
                throw new ErrorResponse_1.ServiceError('Promotion not found', 404);
            }
            return { success: true, data: promotion };
        }
        catch (error) {
            throw new ErrorResponse_1.ServiceError(error.message, 500);
        }
    },
    createPromotion: async (promotionData) => {
        try {
            const promotion = new Promotion_1.Promotion(promotionData);
            await promotion.save();
            return { success: true, data: promotion };
        }
        catch (error) {
            throw new ErrorResponse_1.ServiceError(error.message, 500);
        }
    },
    updatePromotion: async (id, promotionData) => {
        try {
            const promotion = await Promotion_1.Promotion.findByIdAndUpdate(id, promotionData, { new: true });
            if (!promotion) {
                throw new ErrorResponse_1.ServiceError('Promotion not found', 404);
            }
            return { success: true, data: promotion };
        }
        catch (error) {
            throw new ErrorResponse_1.ServiceError(error.message, 500);
        }
    },
    deletePromotion: async (id) => {
        try {
            const promotion = await Promotion_1.Promotion.findByIdAndDelete(id);
            if (!promotion) {
                throw new ErrorResponse_1.ServiceError('Promotion not found', 404);
            }
            return { success: true, data: promotion };
        }
        catch (error) {
            throw new ErrorResponse_1.ServiceError(error.message, 500);
        }
    }
};
