import express,{ Request, Response, Router } from 'express';
import {FavorisService} from '../services/FavorisService';
import { verifyToken } from '../config/middleware';
import { handleResponse, handleError } from '../utils/responseHandler';

const FavorisRouter: Router = express.Router();

FavorisRouter.get('/:userId', verifyToken, async (req: Request, res: Response) => {
    try {
        const response = await FavorisService.getUserFavorites(req.params.userId);
        handleResponse(res, response);
    } catch (error:any) {
        handleError(res, error);
    }
});

FavorisRouter.post('/', verifyToken, async (req: Request, res: Response) => {
    try {
        const { userId, produitId } = req.body;
        
        if (!userId || !produitId) {
            return handleError(res, { 
                statusCode: 400, 
                message: 'User ID and Product ID are required' 
            });
        }
        
        const response = await FavorisService.addFavorite(userId, produitId);
        handleResponse(res, response, 201);
    } catch (error:any) {
        handleError(res, error);
    }
});

FavorisRouter.delete('/:userId/:productId', verifyToken, async (req: Request, res: Response) => {
    try {
        const { userId, productId } = req.params;
        const response = await FavorisService.removeFavorite(userId, productId);
        handleResponse(res, response);
    } catch (error:any) {
        handleError(res, error);
    }
});

FavorisRouter.get('/is-favorited/:userId/:productId', verifyToken, async (req: Request, res: Response) => {
    try {
        const { userId, productId } = req.params;
        const response = await FavorisService.isFavorited(userId, productId);
        handleResponse(res, response);
    } catch (error:any) {
        handleError(res, error);
    }
});

export default FavorisRouter;