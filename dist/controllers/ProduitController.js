"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ProduitService_1 = require("../services/ProduitService");
const middleware_1 = require("../config/middleware");
const responseHandler_1 = require("../utils/responseHandler");
const ProduitController = express_1.default.Router();
ProduitController.get('/', async (req, res) => {
    try {
        const response = await ProduitService_1.produitService.getAllProduits();
        (0, responseHandler_1.handleResponse)(res, response);
    }
    catch (error) {
        (0, responseHandler_1.handleError)(res, error);
    }
});
ProduitController.get('/:id', async (req, res) => {
    try {
        const response = await ProduitService_1.produitService.getProduitById(req.params.id);
        (0, responseHandler_1.handleResponse)(res, response);
    }
    catch (error) {
        (0, responseHandler_1.handleError)(res, error);
    }
});
ProduitController.post('/', middleware_1.verifyToken, async (req, res) => {
    try {
        if (!req.body.nom || !req.body.prix || !req.body.category || !req.body.fournisseur) {
            return (0, responseHandler_1.handleError)(res, {
                statusCode: 400,
                message: 'Name, price, category and supplier are required'
            });
        }
        const response = await ProduitService_1.produitService.createProduit(req.body);
        (0, responseHandler_1.handleResponse)(res, response, 201);
    }
    catch (error) {
        (0, responseHandler_1.handleError)(res, error);
    }
});
ProduitController.put('/:id', middleware_1.verifyToken, async (req, res) => {
    try {
        const response = await ProduitService_1.produitService.updateProduit(req.params.id, req.body);
        (0, responseHandler_1.handleResponse)(res, response);
    }
    catch (error) {
        (0, responseHandler_1.handleError)(res, error);
    }
});
ProduitController.delete('/:id', middleware_1.verifyToken, async (req, res) => {
    try {
        const response = await ProduitService_1.produitService.deleteProduit(req.params.id);
        (0, responseHandler_1.handleResponse)(res, response);
    }
    catch (error) {
        (0, responseHandler_1.handleError)(res, error);
    }
});
ProduitController.get('/search/criteria', async (req, res) => {
    try {
        const criteria = req.query;
        const response = await ProduitService_1.produitService.searchByCriteria(criteria);
        (0, responseHandler_1.handleResponse)(res, response);
    }
    catch (error) {
        (0, responseHandler_1.handleError)(res, error);
    }
});
ProduitController.get('/category/:categoryId', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const response = await ProduitService_1.produitService.getProductsByCategory(req.params.categoryId, limit);
        (0, responseHandler_1.handleResponse)(res, response);
    }
    catch (error) {
        (0, responseHandler_1.handleError)(res, error);
    }
});
ProduitController.get('/search/popular', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const response = await ProduitService_1.produitService.getPopularProducts(limit);
        (0, responseHandler_1.handleResponse)(res, response);
    }
    catch (error) {
        (0, responseHandler_1.handleError)(res, error);
    }
});
ProduitController.get('/byfournisseur/:fournisseurId', async (req, res) => {
    try {
        const response = await ProduitService_1.produitService.getProductsByFournisseur(req.params.fournisseurId);
        (0, responseHandler_1.handleResponse)(res, response);
    }
    catch (error) {
        (0, responseHandler_1.handleError)(res, error);
    }
});
ProduitController.put('/views/:id', async (req, res) => {
    try {
        const response = await ProduitService_1.produitService.incrementProductViews(req.params.id);
        (0, responseHandler_1.handleResponse)(res, response);
    }
    catch (error) {
        (0, responseHandler_1.handleError)(res, error);
    }
});
ProduitController.get('/best-discount', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const response = await ProduitService_1.produitService.getBestDiscounts(limit);
        (0, responseHandler_1.handleResponse)(res, response);
    }
    catch (error) {
        (0, responseHandler_1.handleError)(res, error);
    }
});
ProduitController.get('/current-promotions', async (req, res) => {
    try {
        const response = await ProduitService_1.produitService.getCurrentPromotions();
        (0, responseHandler_1.handleResponse)(res, response);
    }
    catch (error) {
        (0, responseHandler_1.handleError)(res, error);
    }
});
exports.default = ProduitController;
