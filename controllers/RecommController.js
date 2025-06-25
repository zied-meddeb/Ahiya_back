const recommendationService = require('../services/RecommService');
const express = require('express');
const RecommendationController = express.Router();
const verifyToken = require('../config/middleware');


RecommendationController.get('/:userId', verifyToken, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const response = await recommendationService.getRecommendations(
            req.params.userId, 
            limit
        );
        handleResponse(res, response);
    } catch (error) {
        handleError(res, error);
    }
});

RecommendationController.put('/:userId/:productId', verifyToken, async (req, res) => {
    try {
        const increment = parseFloat(req.body.increment) || 0.1;
        const response = await recommendationService.updateRecommendationScore(
            req.params.userId,
            req.params.productId,
            increment
        );
        handleResponse(res, response);
    } catch (error) {
        handleError(res, error);
    }
});

module.exports = RecommendationController;