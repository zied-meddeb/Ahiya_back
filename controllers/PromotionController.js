const promotionService = require('../services/PromotionService');
const express = require('express');
const PromotionController = express.Router();
const verifyToken = require('../config/middleware');
PromotionController.get(`/`, async (req, res) => {
    try {
        const promotions = await promotionService.getAllPromotions();
        res.status(200).json(promotions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
);
PromotionController.get(`/:id`, async (req, res) => {
    try {
        const promotion = await promotionService.getPromotionById(req.params.id);
        res.status(200).json(promotion);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
);
PromotionController.post(`/`, verifyToken,async (req, res) => {
    try {
        const promotion = await promotionService.createPromotion(req.body);
        res.status(201).json(promotion);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
);
PromotionController.put(`/:id`,verifyToken, async (req, res) => {
    try {
        const promotion = await promotionService.updatePromotion(req.params.id, req.body);
        res.status(200).json(promotion);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
);
PromotionController.delete(`/:id`,verifyToken, async (req, res) => {
    try {
        const promotion = await promotionService.deletePromotion(req.params.id);
        res.status(200).json(promotion);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
);
module.exports = PromotionController;