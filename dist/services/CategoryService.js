"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryService = void 0;
const mongoose_1 = require("mongoose");
const Category_1 = require("../entities/Category");
const ErrorResponse_1 = require("../bean/ErrorResponse");
exports.categoryService = {
    getAllCategories: async () => {
        try {
            const categories = await Category_1.Category.find();
            if (!categories || categories.length === 0) {
                throw new ErrorResponse_1.ServiceError('No categories found', 404);
            }
            return {
                success: true,
                data: categories,
                count: categories.length
            };
        }
        catch (error) {
            if (error instanceof ErrorResponse_1.ServiceError)
                throw error;
            throw new ErrorResponse_1.ServiceError(`Failed to fetch categories: ${error.message}`, 500);
        }
    },
    getCategoryById: async (id) => {
        try {
            if (!mongoose_1.Types.ObjectId.isValid(id)) {
                throw new ErrorResponse_1.ServiceError('Invalid Category ID format', 400);
            }
            const category = await Category_1.Category.findById(id);
            if (!category) {
                throw new ErrorResponse_1.ServiceError('Category not found', 404);
            }
            return {
                success: true,
                data: category
            };
        }
        catch (error) {
            if (error instanceof ErrorResponse_1.ServiceError)
                throw error;
            throw new ErrorResponse_1.ServiceError(`Failed to fetch category: ${error.message}`, 500);
        }
    },
    createCategory: async (categoryData) => {
        try {
            if (!categoryData.nom) {
                throw new ErrorResponse_1.ServiceError('Category name is required', 400);
            }
            const existingCategory = await Category_1.Category.findOne({ nom: categoryData.nom });
            if (existingCategory) {
                throw new ErrorResponse_1.ServiceError('Category with this name already exists', 409);
            }
            const category = new Category_1.Category(categoryData);
            await category.save();
            return {
                success: true,
                statusCode: 201,
                message: 'Category created successfully',
                data: category
            };
        }
        catch (error) {
            if (error instanceof ErrorResponse_1.ServiceError)
                throw error;
            throw new ErrorResponse_1.ServiceError(`Category creation failed: ${error.message}`, 500);
        }
    },
    updateCategory: async (id, categoryData) => {
        try {
            if (!mongoose_1.Types.ObjectId.isValid(id)) {
                throw new ErrorResponse_1.ServiceError('Invalid Category ID format', 400);
            }
            if (categoryData.nom) {
                const existingCategory = await Category_1.Category.findOne({
                    nom: categoryData.nom,
                    _id: { $ne: id }
                });
                if (existingCategory) {
                    throw new ErrorResponse_1.ServiceError('Category with this name already exists', 409);
                }
            }
            const category = await Category_1.Category.findByIdAndUpdate(id, categoryData, {
                new: true,
                runValidators: true
            });
            if (!category) {
                throw new ErrorResponse_1.ServiceError('Category not found', 404);
            }
            return {
                success: true,
                message: 'Category updated successfully',
                data: category
            };
        }
        catch (error) {
            if (error instanceof ErrorResponse_1.ServiceError)
                throw error;
            throw new ErrorResponse_1.ServiceError(`Category update failed: ${error.message}`, 500);
        }
    },
    deleteCategory: async (id) => {
        try {
            if (!mongoose_1.Types.ObjectId.isValid(id)) {
                throw new ErrorResponse_1.ServiceError('Invalid Category ID format', 400);
            }
            const category = await Category_1.Category.findByIdAndDelete(id);
            if (!category) {
                throw new ErrorResponse_1.ServiceError('Category not found', 404);
            }
            return {
                success: true,
                message: 'Category deleted successfully',
                data: category
            };
        }
        catch (error) {
            if (error instanceof ErrorResponse_1.ServiceError)
                throw error;
            throw new ErrorResponse_1.ServiceError(`Category deletion failed: ${error.message}`, 500);
        }
    }
};
