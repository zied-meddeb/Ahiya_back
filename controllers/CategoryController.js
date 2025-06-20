const CategoryService = require('../services/CategoryService');
const express = require('express');
const CategoryController = express.Router();
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

CategoryController.get('/', async (req, res) => {
    try {
        const response = await CategoryService.getAllCategories();
        handleResponse(res, response);
    } catch (error) {
        handleError(res, error);
    }
});

CategoryController.get('/:id', async (req, res) => {
    try {
        const response = await CategoryService.getCategoryById(req.params.id);
        handleResponse(res, response);
    } catch (error) {
        handleError(res, error);
    }
});

CategoryController.post('/', verifyToken, async (req, res) => {
    try {
        if (!req.body.nom) {
            return handleError(res, { 
                statusCode: 400, 
                message: 'Category name is required' 
            });
        }
        
        const response = await CategoryService.createCategory(req.body);
        handleResponse(res, response, 201);
    } catch (error) {
        handleError(res, error);
    }
});

CategoryController.put('/:id', verifyToken, async (req, res) => {
    try {
        const response = await CategoryService.updateCategory(req.params.id, req.body);
        handleResponse(res, response);
    } catch (error) {
        handleError(res, error);
    }
});

CategoryController.delete('/:id', verifyToken, async (req, res) => {
    try {
        const response = await CategoryService.deleteCategory(req.params.id);
        handleResponse(res, response);
    } catch (error) {
        handleError(res, error);
    }
});

module.exports = CategoryController;