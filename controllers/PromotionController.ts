import express,{ Request, Response, Router } from 'express';
import {promotionService} from '../services/PromotionService';
import {verifyToken} from '../config/middleware';
import { handleResponse, handleError } from '../utils/responseHandler';

const PromotionController: Router = express.Router();

PromotionController.get(`/`, async (req: Request, res: Response) => {
    try {
        const promotions = await promotionService.getAllPromotions();
        handleResponse(res, promotions);
    } catch (error:any) {
        handleError(res, error);
    }
});

PromotionController.get(`/:id`, async (req: Request, res: Response) => {
    try {
        const promotion = await promotionService.getPromotionById(req.params.id);
        handleResponse(res, promotion);
    } catch (error:any) {
        handleError(res, error);
    }
});

PromotionController.post(`/`, verifyToken, async (req: Request, res: Response) => {
    try {
        const promotion = await promotionService.createPromotion(req.body);
        handleResponse(res, promotion);
    } catch (error:any) {
        handleError(res, error);
    }
});

PromotionController.put(`/:id`, verifyToken, async (req: Request, res: Response) => {
    try {
        const promotion = await promotionService.updatePromotion(req.params.id, req.body);
        handleResponse(res, promotion);
    } catch (error:any) {
        handleError(res, error);
    }
});

PromotionController.delete(`/:id`, verifyToken, async (req: Request, res: Response) => {
    try {
        const promotion = await promotionService.deletePromotion(req.params.id);
        handleResponse(res, promotion);
    } catch (error:any) {
        handleError(res, error);
    }
});

export default PromotionController;