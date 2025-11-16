"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const CategoryService_1 = require("../services/CategoryService");
const middleware_1 = require("../middleware/middleware");
const responseHandler_1 = require("../utils/responseHandler");
const upload_1 = require("../middleware/upload");
const CategoryController = express_1.default.Router();
CategoryController.get('/', async (req, res) => {
    try {
        const response = await CategoryService_1.categoryService.getAllCategories();
        (0, responseHandler_1.handleResponse)(res, response);
    }
    catch (error) {
        (0, responseHandler_1.handleError)(res, error);
    }
});
CategoryController.get('/:id', async (req, res) => {
    try {
        const response = await CategoryService_1.categoryService.getCategoryById(req.params.id);
        (0, responseHandler_1.handleResponse)(res, response);
    }
    catch (error) {
        (0, responseHandler_1.handleError)(res, error);
    }
});
CategoryController.post('/', middleware_1.verifyToken, (0, upload_1.uploadImageToCloudinary)("image"), async (req, res) => {
    try {
        if (!req.body.nom) {
            return (0, responseHandler_1.handleError)(res, {
                statusCode: 400,
                message: 'Category name is required'
            });
        }
        if (req.uploadedImageUrl) {
            req.body.imageUrl = req.uploadedImageUrl;
        }
        else {
            return (0, responseHandler_1.handleError)(res, {
                statusCode: 400,
                message: 'Category Image is required'
            });
        }
        // ✅ Traitement du champ parentCategories si présent
        if (req.body.parentCategories) {
            if (typeof req.body.parentCategories === 'string') {
                try {
                    const parsed = JSON.parse(req.body.parentCategories);
                    // Vérifie que c'est bien un tableau
                    if (!Array.isArray(parsed)) {
                        return (0, responseHandler_1.handleError)(res, {
                            statusCode: 400,
                            message: 'parentCategories must be a JSON array of IDs'
                        });
                    }
                    req.body.parentCategories = parsed;
                }
                catch (err) {
                    return (0, responseHandler_1.handleError)(res, {
                        statusCode: 400,
                        message: 'Invalid JSON in parentCategories field'
                    });
                }
            }
        }
        const response = await CategoryService_1.categoryService.createCategory(req.body);
        (0, responseHandler_1.handleResponse)(res, response, 201);
    }
    catch (error) {
        (0, responseHandler_1.handleError)(res, error);
    }
});
CategoryController.put('/:id', middleware_1.verifyToken, async (req, res) => {
    try {
        const response = await CategoryService_1.categoryService.updateCategory(req.params.id, req.body);
        (0, responseHandler_1.handleResponse)(res, response);
    }
    catch (error) {
        (0, responseHandler_1.handleError)(res, error);
    }
});
CategoryController.delete('/:id', middleware_1.verifyToken, async (req, res) => {
    try {
        const response = await CategoryService_1.categoryService.deleteCategory(req.params.id);
        (0, responseHandler_1.handleResponse)(res, response);
    }
    catch (error) {
        (0, responseHandler_1.handleError)(res, error);
    }
});
exports.default = CategoryController;
//# sourceMappingURL=CategoryController.js.map