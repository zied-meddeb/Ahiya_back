const express = require('express');
const FavorisRouter = express.Router();
const FavorisService = require('../services/FavorisService');
const verifyToken = require('../config/middleware');

const { handleResponse, handleError } = require('../utils/responseHandler');

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