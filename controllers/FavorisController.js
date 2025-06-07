const express = require('express');
const FavorisRouter = express.Router();
const FavorisService = require('../services/FavorisService');

// Get all favoris
FavorisRouter.get('/', async (req, res) => {
    try {
        const favoris = await FavorisService.getAllFavoris();
        res.status(200).json(favoris);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// Get favoris by user ID
FavorisRouter.get('/user/:userId', async (req, res) => {
    try {
        const favoris = await FavorisService.getFavorisByUserId(req.params.userId);
        res.status(200).json(favoris);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// Add favoris
FavorisRouter.post('/', async (req, res) => {
    try {
        const favorisData = req.body;
        const favoris = await FavorisService.addFavoris(favorisData);
        res.status(201).json(favoris);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// Remove favoris
FavorisRouter.delete('/:id', async (req, res) => {
    try {
        const favoris = await FavorisService.removeFavoris(req.params.id);
        res.status(200).json(favoris);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
module.exports = FavorisRouter;