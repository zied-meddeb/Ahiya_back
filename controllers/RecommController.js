const recommendationService = require('../services/RecommService');
const express = require('express');
const RecommendationController = express.Router();
const verifyToken = require('../config/middleware');

const handleResponse = (res, serviceResponse, successStatus = 200) => {
    if (serviceResponse.success) {
        res.status(serviceResponse.statusCode || successStatus).json({
            success: true,
            message: serviceResponse.message,
            ...serviceResponse.data
        });
    } else {
        res.status(serviceResponse.statusCode || 500).json({
            success: false,
            message: serviceResponse.message
        });
    }
};

const handleError = (res, error) => {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: error.message || 'An unexpected error occurred'
    });
};

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