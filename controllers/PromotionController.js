const promotionService = require('../services/PromotionService');
const express = require('express');
const PromotionController = express.Router();
const verifyToken = require('../config/middleware');

const { handleResponse, handleError } = require('../utils/responseHandler');

PromotionController.get(`/`, async (req, res) => {
    try {
        const promotions = await promotionService.getAllPromotions();
        handleResponse(res, promotions);
    } catch (error) {
        handleError(res, error);
    }
});

PromotionController.get(`/:id`, async (req, res) => {
    try {
        const promotion = await promotionService.getPromotionById(req.params.id);
        handleResponse(res, promotion);
    } catch (error) {
        handleError(res, error);
    }
});

PromotionController.post(`/`, verifyToken, async (req, res) => {
    try {
        const promotion = await promotionService.createPromotion(req.body);
        handleResponse(res, promotion);
    } catch (error) {
        handleError(res, error);
    }
});

PromotionController.put(`/:id`, verifyToken, async (req, res) => {
    try {
        const promotion = await promotionService.updatePromotion(req.params.id, req.body);
        handleResponse(res, promotion);
    } catch (error) {
        handleError(res, error);
    }
});

PromotionController.delete(`/:id`, verifyToken, async (req, res) => {
    try {
        const promotion = await promotionService.deletePromotion(req.params.id);
        handleResponse(res, promotion);
    } catch (error) {
        handleError(res, error);
    }
});

module.exports = PromotionController;