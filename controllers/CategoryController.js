const CategoryService = require('../services/CategoryService');
const express = require('express');
const CategoryController = express.Router();


CategoryController.get(`/`, async (req, res) => {
    try {
        const categories = await CategoryService.getAllCategories();
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
);
CategoryController.get(`/:id`, async (req, res) => {
    try {
        const category = await CategoryService.getCategoryById(req.params.id);
        res.status(200).json(category);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
);

CategoryController.post(`/`, async (req, res) => {
    try {
        const category = await CategoryService.createCategory(req.body);
        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
);
CategoryController.put(`/:id`, async (req, res) => {
    try {
        const category = await CategoryService.updateCategory(req.params.id, req.body);
        res.status(200).json(category);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
);
CategoryController.delete(`/:id`, async (req, res) => {
    try {
        const category = await CategoryService.deleteCategory(req.params.id);
        res.status(200).json(category);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
);

module.exports = CategoryController;