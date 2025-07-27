import express, { Request, Response, Router } from 'express';
import { categoryService } from '../services/CategoryService';
import { verifyToken } from '../middleware/middleware';
import { handleResponse, handleError } from '../utils/responseHandler';
import { uploadImageToCloudinary } from '../middleware/upload';

const CategoryController: Router = express.Router();

CategoryController.get('/', async (req: Request, res: Response) => {
    try {
        const response = await categoryService.getAllCategories();
        handleResponse(res, response);
    } catch (error: any) {
        handleError(res, error);
    }
});

CategoryController.get('/:id', async (req: Request, res: Response) => {
    try {
        const response = await categoryService.getCategoryById(req.params.id);
        handleResponse(res, response);
    } catch (error: any) {
        handleError(res, error);
    }
});

CategoryController.post('/',
    verifyToken,
    uploadImageToCloudinary("image"),
    async (req: any, res: any) => {
        try {
            if (!req.body.nom) {
                return handleError(res, {
                    statusCode: 400,
                    message: 'Category name is required'
                });
            }
            if (req.uploadedImageUrl) {
                req.body.imageUrl = req.uploadedImageUrl;
            }
            else {
                return handleError(res, {
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
                            return handleError(res, {
                                statusCode: 400,
                                message: 'parentCategories must be a JSON array of IDs'
                            });
                        }

                        req.body.parentCategories = parsed;
                    } catch (err) {
                        return handleError(res, {
                            statusCode: 400,
                            message: 'Invalid JSON in parentCategories field'
                        });
                    }
                }
            }
            
            const response = await categoryService.createCategory(req.body);
            handleResponse(res, response, 201);
        } catch (error: any) {
            handleError(res, error);
        }
    });

CategoryController.put('/:id', verifyToken, async (req: Request, res: Response) => {
    try {
        const response = await categoryService.updateCategory(req.params.id, req.body);
        handleResponse(res, response);
    } catch (error: any) {
        handleError(res, error);
    }
});

CategoryController.delete('/:id', verifyToken, async (req: Request, res: Response) => {
    try {
        const response = await categoryService.deleteCategory(req.params.id);
        handleResponse(res, response);
    } catch (error: any) {
        handleError(res, error);
    }
});

export default CategoryController;