const express = require('express');
const FavorisRouter = express.Router();
const FavorisService = require('../services/FavorisService');
const verifyToken = require('../config/middleware');

const handleResponse = (res, serviceResponse, successStatus = 200) => {
    if (serviceResponse.success) {
        res.status(serviceResponse.statusCode || successStatus).json({
            success: true,
            message: serviceResponse.message,
            data: serviceResponse.data,
            ...(serviceResponse.count !== undefined && { count: serviceResponse.count })
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

// Get user's favorites
FavorisRouter.get('/:userId', verifyToken, async (req, res) => {
    try {
        const response = await FavorisService.getUserFavorites(req.params.userId);
        handleResponse(res, response);
    } catch (error) {
        handleError(res, error);
    }
});

// Toggle favorite (add or remove)
FavorisRouter.post('/', verifyToken, async (req, res) => {
    try {
        const { userId, produitId } = req.body;
        
        if (!userId || !produitId) {
            return handleError(res, { 
                statusCode: 400, 
                message: 'User ID and Product ID are required' 
            });
        }
        
        const response = await FavorisService.addFavorite(userId, produitId);
        handleResponse(res, response, 201);
    } catch (error) {
        handleError(res, error);
    }
});

// Remove favorite
FavorisRouter.delete('/:userId/:productId', verifyToken, async (req, res) => {
    try {
        const { userId, productId } = req.params;
        const response = await FavorisService.removeFavorite(userId, productId);
        handleResponse(res, response);
    } catch (error) {
        handleError(res, error);
    }
});

// Check if product is favorited
FavorisRouter.get('/is-favorited/:userId/:productId', verifyToken, async (req, res) => {
    try {
        const { userId, productId } = req.params;
        const response = await FavorisService.isFavorited(userId, productId);
        handleResponse(res, response);
    } catch (error) {
        handleError(res, error);
    }
});

module.exports = FavorisRouter;