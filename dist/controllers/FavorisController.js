"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const FavorisService_1 = require("../services/FavorisService");
const middleware_1 = require("../middleware/middleware");
const responseHandler_1 = require("../utils/responseHandler");
const FavorisRouter = express_1.default.Router();
FavorisRouter.get('/:userId', middleware_1.verifyToken, async (req, res) => {
    try {
        const response = await FavorisService_1.FavorisService.getUserFavorites(req.params.userId);
        (0, responseHandler_1.handleResponse)(res, response);
    }
    catch (error) {
        (0, responseHandler_1.handleError)(res, error);
    }
});
FavorisRouter.post('/', middleware_1.verifyToken, async (req, res) => {
    try {
        const { userId, produitId } = req.body;
        if (!userId || !produitId) {
            return (0, responseHandler_1.handleError)(res, {
                statusCode: 400,
                message: 'User ID and Product ID are required'
            });
        }
        const response = await FavorisService_1.FavorisService.addFavorite(userId, produitId);
        (0, responseHandler_1.handleResponse)(res, response, 201);
    }
    catch (error) {
        (0, responseHandler_1.handleError)(res, error);
    }
});
FavorisRouter.delete('/:userId/:productId', middleware_1.verifyToken, async (req, res) => {
    try {
        const { userId, productId } = req.params;
        const response = await FavorisService_1.FavorisService.removeFavorite(userId, productId);
        (0, responseHandler_1.handleResponse)(res, response);
    }
    catch (error) {
        (0, responseHandler_1.handleError)(res, error);
    }
});
FavorisRouter.get('/is-favorited/:userId/:productId', middleware_1.verifyToken, async (req, res) => {
    try {
        const { userId, productId } = req.params;
        const response = await FavorisService_1.FavorisService.isFavorited(userId, productId);
        (0, responseHandler_1.handleResponse)(res, response);
    }
    catch (error) {
        (0, responseHandler_1.handleError)(res, error);
    }
});
exports.default = FavorisRouter;
//# sourceMappingURL=FavorisController.js.map