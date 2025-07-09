import express,{ Request, Response, Router } from 'express';
import {categoryService} from '../services/CategoryService';
import { verifyToken } from '../config/middleware';
import { handleResponse, handleError } from '../utils/responseHandler';

const CategoryController: Router = express.Router();

CategoryController.get('/', async (req: Request, res: Response) => {
    try {
        const response = await categoryService.getAllCategories();
        handleResponse(res, response);
    } catch (error:any) {
        handleError(res, error);
    }
});

CategoryController.get('/:id', async (req: Request, res: Response) => {
    try {
        const response = await categoryService.getCategoryById(req.params.id);
        handleResponse(res, response);
    } catch (error:any) {
        handleError(res, error);
    }
});

CategoryController.post('/', verifyToken, async (req: Request, res: Response) => {
    try {
        if (!req.body.nom) {
            return handleError(res, { 
                statusCode: 400, 
                message: 'Category name is required' 
            });
        }
        
        const response = await categoryService.createCategory(req.body);
        handleResponse(res, response, 201);
    } catch (error:any) {
        handleError(res, error);
    }
});

CategoryController.put('/:id', verifyToken, async (req: Request, res: Response) => {
    try {
        const response = await categoryService.updateCategory(req.params.id, req.body);
        handleResponse(res, response);
    } catch (error:any) {
        handleError(res, error);
    }
});

CategoryController.delete('/:id', verifyToken, async (req: Request, res: Response) => {
    try {
        const response = await categoryService.deleteCategory(req.params.id);
        handleResponse(res, response);
    } catch (error:any) {
        handleError(res, error);
    }
});

export default CategoryController;