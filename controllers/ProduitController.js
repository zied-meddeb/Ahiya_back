const produitService = require('../services/ProduitService');
const express = require('express');
const ProduitController = express.Router();
const verifyToken = require('../config/middleware');

const { handleResponse, handleError } = require('../utils/responseHandler');


ProduitController.get('/', async (req, res) => {
    try {
        const response = await produitService.getAllProduits();
        handleResponse(res, response);
    } catch (error) {
        handleError(res, error);
    }
});

ProduitController.get('/:id', async (req, res) => {
    try {
        const response = await produitService.getProduitById(req.params.id);
        handleResponse(res, response);
    } catch (error) {
        handleError(res, error);
    }
});

ProduitController.post('/', verifyToken, async (req, res) => {
    try {
        if (!req.body.nom || !req.body.prix || !req.body.category || !req.body.fournisseur) {
            return handleError(res, { 
                statusCode: 400, 
                message: 'Name, price, category and supplier are required' 
            });
        }
        
        const response = await produitService.createProduit(req.body);
        handleResponse(res, response, 201);
    } catch (error) {
        handleError(res, error);
    }
});

ProduitController.put('/:id', verifyToken, async (req, res) => {
    try {
        const response = await produitService.updateProduit(req.params.id, req.body);
        handleResponse(res, response);
    } catch (error) {
        handleError(res, error);
    }
});

ProduitController.delete('/:id', verifyToken, async (req, res) => {
    try {
        const response = await produitService.deleteProduit(req.params.id);
        handleResponse(res, response);
    } catch (error) {
        handleError(res, error);
    }
});

ProduitController.get('/search/criteria', async (req, res) => {
    try {
        const criteria = req.query;
        const response = await produitService.searchByCriteria(criteria);
        handleResponse(res, response);
    } catch (error) {
        handleError(res, error);
    }
});

ProduitController.get('/category/:categoryId', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const response = await produitService.getProductsByCategory(
            req.params.categoryId, 
            limit
        );
        handleResponse(res, response);
    } catch (error) {
        handleError(res, error);
    }
});

ProduitController.get('/search/popular', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const response = await produitService.getPopularProducts(limit);
        handleResponse(res, response);
    } catch (error) {
        handleError(res, error);
    }
});

ProduitController.get('/byfournisseur/:fournisseurId', async (req, res) => {
    try {
        const response = await produitService.getProductsByFournisseur(
            req.params.fournisseurId
        );
        handleResponse(res, response);
    } catch (error) {
        handleError(res, error);
    }
});

ProduitController.put('/views/:id', async (req, res) => {
    try {
        const response = await produitService.incrementProductViews(req.params.id);
        handleResponse(res, response);
    } catch (error) {
        handleError(res, error);
    }
});

ProduitController.get('/best-discount', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const response = await produitService.getBestDiscounts(limit);
        handleResponse(res, response);
    } catch (error) {
        handleError(res, error);
    }
});

ProduitController.get('/current-promotions', async (req, res) => {
    try {
        const response = await produitService.getCurrentPromotions();
        handleResponse(res, response);
    } catch (error) {
        handleError(res, error);
    }
});

module.exports = ProduitController;