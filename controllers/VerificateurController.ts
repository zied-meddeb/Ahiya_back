import express,{ Request, Response, Router } from 'express';
import verificateurService from '../services/VerificateurService';
import {verifyToken} from '../config/middleware';
import { handleResponse, handleError } from '../utils/responseHandler';

const VerficateurController: Router = express.Router();

VerficateurController.get(`/`, verifyToken, async (req: Request, res: Response) => {
    try {
        const verificateurs = await verificateurService.getAllVerificateurs();
        handleResponse(res, verificateurs);
    } catch (error:any) {
        handleError(res, error);
    }
});

VerficateurController.get(`/:id`, verifyToken, async (req: Request, res: Response) => {
    try {
        const verificateur = await verificateurService.getVerificateurById(req.params.id);
        handleResponse(res, verificateur);
    } catch (error:any) {
        handleError(res, error);
    }
});

VerficateurController.put(`/:id`, verifyToken, async (req: Request, res: Response) => {
    try {
        const verificateur = await verificateurService.updateVerificateur(req.params.id, req.body);
        handleResponse(res, verificateur);
    } catch (error:any) {
        handleError(res, error);
    }
});

VerficateurController.delete(`/:id`, verifyToken, async (req: Request, res: Response) => {
    try {
        const verificateur = await verificateurService.deleteVerificateur(req.params.id);
        handleResponse(res, verificateur);
    } catch (error:any) {
        handleError(res, error);
    }
});

VerficateurController.post(`/auth/login`, async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const verificateur = await verificateurService.loginVerificateur(email, password);
        if (!verificateur) {
            return handleError(res, new Error('Invalid credentials'));
        }
        handleResponse(res, verificateur);
    } catch (error:any) {
        handleError(res, error);
    }
});

VerficateurController.post(`/auth/register`, async (req: Request, res: Response) => {
    try {
        const verificateur = await verificateurService.createVerificateur(req.body);
        handleResponse(res, verificateur);
    } catch (error:any) {
        handleError(res, error);
    }
});



export default VerficateurController;