import express,{ Request, Response, Router } from 'express';
import UserService from '../services/UserService';
import {verifyToken} from '../config/middleware';
import crypto from 'crypto';
import { handleResponse, handleError } from '../utils/responseHandler';

const UserController: Router = express.Router();

UserController.get('/', verifyToken, async (req: Request, res: Response) => {
    try {
        const response = await UserService.getAllUsers();
        handleResponse(res, response);
    } catch (error:any) {
        handleError(res, error);
    }
});

UserController.get('/:id', verifyToken, async (req: Request, res: Response) => {
    try {
        const response = await UserService.getUserById(req.params.id);
        handleResponse(res, response);
    } catch (error:any) {
        handleError(res, error);
    }
});

UserController.post('/', async (req: Request, res: Response) => {
    try {
        if (!req.body.email || !req.body.password) {
            return handleError(res, { 
                statusCode: 400, 
                message: 'Email and password are required' 
            });
        }
        
        const response = await UserService.createUser(req.body);
        handleResponse(res, response, 201);
    } catch (error:any) {
        handleError(res, error);
    }
});

UserController.put('/:id', verifyToken, async (req: Request, res: Response) => {
    try {
        const response = await UserService.updateUser(req.params.id, req.body);
        handleResponse(res, response);
    } catch (error:any) {
        handleError(res, error);
    }
});

UserController.delete('/:id', verifyToken, async (req: Request, res: Response) => {
    try {
        const response = await UserService.deleteUser(req.params.id);
        handleResponse(res, response);
    } catch (error:any) {
        handleError(res, error);
    }
});

UserController.delete('/not-verified/user', async (req: Request, res: Response) => {
    try {
        const response = await UserService.deleteUnverifiedUser(req.body.email);
        handleResponse(res, response);
    } catch (error:any) {
        handleError(res, error);
    }
});

UserController.post('/auth/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return handleError(res, { 
                statusCode: 400, 
                message: 'Email and password are required' 
            });
        }
        
        const response = await UserService.loginUser(email, password);
        handleResponse(res, response);
    } catch (error:any) {
        handleError(res, error);
    }
});

UserController.post('/auth/verify', async (req: Request, res: Response) => {
    try {
        const { email, code } = req.body;
        
        if (!email || !code) {
            return handleError(res, { 
                statusCode: 400, 
                message: 'Email and verification code are required' 
            });
        }
        
        const response = await UserService.verifyEmail(email, code);
        handleResponse(res, response);
    } catch (error:any) {
        handleError(res, error);
    }
});

UserController.put('/preferences/:id', verifyToken, async (req: Request, res: Response) => {
    try {
        const response = await UserService.updateUserPreferences(
            req.params.id, 
            req.body
        );
        handleResponse(res, response);
    } catch (error:any) {
        handleError(res, error);
    }
});

UserController.get('/preferences/:id', verifyToken, async (req: Request, res: Response) => {
    try {
        const response = await UserService.getUserPreferences(req.params.id);
        handleResponse(res, response);
    } catch (error:any) {
        handleError(res, error);
    }
});

UserController.put('/history/:id', verifyToken, async (req: Request, res: Response) => {
    try {
        if (!req.body.query) {
            return handleError(res, { 
                statusCode: 400, 
                message: 'Search query is required' 
            });
        }
        
        const response = await UserService.addToSearchHistory(
            req.params.id, 
            req.body.query
        );
        handleResponse(res, response);
    } catch (error:any) {
        handleError(res, error);
    }
});

UserController.put('/last-views/:id/:prodId', verifyToken, async (req: Request, res: Response) => {
    try {
        const response = await UserService.trackProductView(
            req.params.id, 
            req.params.prodId
        );
        handleResponse(res, response);
    } catch (error:any) {
        handleError(res, error);
    }
});

UserController.get('/last-views/:id', verifyToken, async (req: Request, res: Response) => {
    try {
        const limit = parseInt(req.query.limit as string) || 5;
        const response = await UserService.getRecentViews(
            req.params.id, 
            limit
        );
        handleResponse(res, response);
    } catch (error:any) {
        handleError(res, error);
    }
});

UserController.post('/send-verification-code', async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return handleError(res, { 
                statusCode: 400, 
                message: 'Email is required' 
            });
        }
        const verificationCode = crypto.randomInt(100000, 999999).toString();
        const response = await UserService.sendVerificationEmail(email, verificationCode);
        handleResponse(res, response);
    } catch (error:any) {
        handleError(res, error);
    }
});

export default UserController;