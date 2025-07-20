import {  Types } from 'mongoose';
import { Category,ICategory } from '../entities/Category';
import { ServiceError } from '../utils/ErrorResponse';

interface CategoryResponse {
    success: boolean;
    statusCode?: number;
    message?: string;
    data?: ICategory | ICategory[];
    count?: number;
}

export const categoryService = {
    getAllCategories: async (): Promise<CategoryResponse> => {
        try {
            const categories = await Category.find();
            
            if (!categories || categories.length === 0) {
                throw new ServiceError('No categories found', 404);
            }
            
            return {
                success: true,
                data: categories,
                count: categories.length
            };
        } catch (error:any) {
            if (error instanceof ServiceError) throw error;
            throw new ServiceError(`Failed to fetch categories: ${error.message}`, 500);
        }
    },

    getCategoryById: async (id: string): Promise<CategoryResponse> => {
        try {
            if (!Types.ObjectId.isValid(id)) {
                throw new ServiceError('Invalid Category ID format', 400);
            }
            
            const category = await Category.findById(id);
            if (!category) {
                throw new ServiceError('Category not found', 404);
            }
            
            return {
                success: true,
                data: category
            };
        } catch (error:any) {
            if (error instanceof ServiceError) throw error;
            throw new ServiceError(`Failed to fetch category: ${error.message}`, 500);
        }
    },

    createCategory: async (categoryData: Partial<ICategory>): Promise<CategoryResponse> => {
        try {
            if (!categoryData.nom) {
                throw new ServiceError('Category name is required', 400);
            }
            
            const existingCategory = await Category.findOne({ nom: categoryData.nom });
            if (existingCategory) {
                throw new ServiceError('Category with this name already exists', 409);
            }
            
            const category = new Category(categoryData);
            await category.save();
            
            return {
                success: true,
                statusCode: 201,
                message: 'Category created successfully',
                data: category
            };
        } catch (error:any) {
            if (error instanceof ServiceError) throw error;
            throw new ServiceError(`Category creation failed: ${error.message}`, 500);
        }
    },

    updateCategory: async (id: string, categoryData: Partial<ICategory>): Promise<CategoryResponse> => {
        try {
            if (!Types.ObjectId.isValid(id)) {
                throw new ServiceError('Invalid Category ID format', 400);
            }
            
            if (categoryData.nom) {
                const existingCategory = await Category.findOne({ 
                    nom: categoryData.nom, 
                    _id: { $ne: id } 
                });
                
                if (existingCategory) {
                    throw new ServiceError('Category with this name already exists', 409);
                }
            }
            
            const category = await Category.findByIdAndUpdate(id, categoryData, { 
                new: true,
                runValidators: true 
            });
            
            if (!category) {
                throw new ServiceError('Category not found', 404);
            }
            
            return {
                success: true,
                message: 'Category updated successfully',
                data: category
            };
        } catch (error:any) {
            if (error instanceof ServiceError) throw error;
            throw new ServiceError(`Category update failed: ${error.message}`, 500);
        }
    },

    deleteCategory: async (id: string): Promise<CategoryResponse> => {
        try {
            if (!Types.ObjectId.isValid(id)) {
                throw new ServiceError('Invalid Category ID format', 400);
            }
            
            const category = await Category.findByIdAndDelete(id);
            
            if (!category) {
                throw new ServiceError('Category not found', 404);
            }
            
            return {
                success: true,
                message: 'Category deleted successfully',
                data: category
            };
        } catch (error:any) {
            if (error instanceof ServiceError) throw error;
            throw new ServiceError(`Category deletion failed: ${error.message}`, 500);
        }
    }
};