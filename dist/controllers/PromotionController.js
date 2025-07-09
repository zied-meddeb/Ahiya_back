"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const PromotionService_1 = require("../services/PromotionService");
const middleware_1 = require("../config/middleware");
const responseHandler_1 = require("../utils/responseHandler");
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
PromotionController.post(`/`, middleware_1.verifyToken, async (req, res) => {
    try {
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
exports.default = PromotionController;
