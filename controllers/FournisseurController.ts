import express,{ Request, Response, Router } from 'express';
import {fournisseurService} from '../services/FournisseurService';
import {verifyToken} from '../middleware/middleware';
import { handleResponse, handleError } from '../utils/responseHandler';

const FournisseurController: Router = express.Router();

FournisseurController.get(`/`, verifyToken, async (req: Request, res: Response) => {
    try {
        const response = await fournisseurService.getAllFournisseurs();
        handleResponse(res, response);
    } catch (error:any) {
        handleError(res, error);
    }
});

FournisseurController.get(`/:id`, verifyToken, async (req: Request, res: Response) => {
    try {
        const response = await fournisseurService.getFournisseurById(req.params.id);
        handleResponse(res, response);
    } catch (error:any) {
        handleError(res, error);
    }
});

FournisseurController.post(`/`, async (req: Request, res: Response) => {
    try {
        const response = await fournisseurService.createFournisseur(req.body);
        handleResponse(res, response);
    } catch (error:any) {
        handleError(res, error);
    }
});

FournisseurController.put(`/:id`, verifyToken, async (req: Request, res: Response) => {
    try {
        const response = await fournisseurService.updateFournisseur(req.params.id, req.body);
        handleResponse(res, response);
    } catch (error:any) {
        handleError(res, error);
    }
});

FournisseurController.delete(`/:id`, verifyToken, async (req: Request, res: Response) => {
    try {
        const response = await fournisseurService.deleteFournisseur(req.params.id);
        handleResponse(res, response);
    } catch (error:any) {
        handleError(res, error);
    }
});

FournisseurController.post(`/auth/login`, async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const response = await fournisseurService.loginFournisseur(email, password);
        handleResponse(res, response);
    } catch (error:any) {
        handleError(res, error);
    }
});


FournisseurController.post('/auth/verify', async (req: Request, res: Response) => {
    try {
        const { email, code } = req.body;
        
        if (!email || !code) {
            return handleError(res, { 
                statusCode: 400, 
                message: 'Email and verification code are required' 
            });
        }
        
        const response = await fournisseurService.verifyEmail(email, code);
        handleResponse(res, response);
    } catch (error:any) {
        handleError(res, error);
    }
});




export default FournisseurController;