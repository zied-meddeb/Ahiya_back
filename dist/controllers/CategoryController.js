"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const CategoryService_1 = require("../services/CategoryService");
const middleware_1 = require("../config/middleware");
const responseHandler_1 = require("../utils/responseHandler");
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
CategoryController.post('/', middleware_1.verifyToken, async (req, res) => {
    try {
        if (!req.body.nom) {
            return (0, responseHandler_1.handleError)(res, {
                statusCode: 400,
                message: 'Category name is required'
            });
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
