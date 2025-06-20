const UserService = require('../services/UserService');
const express = require('express');
const UserController = express.Router();
const verifyToken = require('../config/middleware');
const crypto = require('crypto');
const handleResponse = (res, serviceResponse, successStatus = 200) => {
    if (serviceResponse.success) {
        res.status(serviceResponse.statusCode || successStatus).json({
            success: true,
            message: serviceResponse.message,
            data: serviceResponse.data
        });
    } else {
        res.status(serviceResponse.statusCode || 500).json({
            success: false,
            message: serviceResponse.message
        });
    }
};

const handleError = (res, error) => {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: error.message || 'An unexpected error occurred'
    });
};

UserController.get('/', verifyToken, async (req, res) => {
    try {
        const response = await UserService.getAllUsers();
        handleResponse(res, response);
    } catch (error) {
        handleError(res, error);
    }
});

UserController.get('/:id', verifyToken, async (req, res) => {
    try {
        const response = await UserService.getUserById(req.params.id);
        handleResponse(res, response);
    } catch (error) {
        handleError(res, error);
    }
});

UserController.post('/', async (req, res) => {
    try {
        if (!req.body.email || !req.body.password) {
            return handleError(res, { 
                statusCode: 400, 
                message: 'Email and password are required' 
            });
        }
        
        const response = await UserService.createUser(req.body);
        handleResponse(res, response, 201);
    } catch (error) {
        handleError(res, error);
    }
});

UserController.put('/:id', verifyToken, async (req, res) => {
    try {
        const response = await UserService.updateUser(req.params.id, req.body);
        handleResponse(res, response);
    } catch (error) {
        handleError(res, error);
    }
});

UserController.delete('/:id', verifyToken, async (req, res) => {
    try {
        const response = await UserService.deleteUser(req.params.id);
        handleResponse(res, response);
    } catch (error) {
        handleError(res, error);
    }
});

UserController.delete('/not-verified/user', async (req, res) => {
    try {
        const response = await UserService.deleteUnverifiedUser(req.body.email);
        handleResponse(res, response);
    } catch (error) {
        handleError(res, error);
    }
});

UserController.post('/auth/login', async (req, res) => {
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
    } catch (error) {
        handleError(res, error);
    }
});

UserController.post('/auth/verify', async (req, res) => {
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
    } catch (error) {
        handleError(res, error);
    }
});

UserController.put('/preferences/:id', verifyToken, async (req, res) => {
    try {
        const response = await UserService.updateUserPreferences(
            req.params.id, 
            req.body
        );
        handleResponse(res, response);
    } catch (error) {
        handleError(res, error);
    }
});

UserController.get('/preferences/:id', verifyToken, async (req, res) => {
    try {
        const response = await UserService.getUserPreferences(req.params.id);
        handleResponse(res, response);
    } catch (error) {
        handleError(res, error);
    }
});

UserController.put('/history/:id', verifyToken, async (req, res) => {
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
    } catch (error) {
        handleError(res, error);
    }
});

UserController.put('/last-views/:id/:prodId', verifyToken, async (req, res) => {
    try {
        const response = await UserService.trackProductView(
            req.params.id, 
            req.params.prodId
        );
        handleResponse(res, response);
    } catch (error) {
        handleError(res, error);
    }
});

UserController.get('/last-views/:id', verifyToken, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5;
        const response = await UserService.getRecentViews(
            req.params.id, 
            limit
        );
        handleResponse(res, response);
    } catch (error) {
        handleError(res, error);
    }
});

UserController.post('/send-verification-code', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return handleError(res, { 
                statusCode: 400, 
                message: 'Email is required' 
            });
        }
        const verificationCode = crypto.randomInt(100000, 999999).toString();
        const response = await UserService.sendVerificationEmail(email,verificationCode);
        handleResponse(res, response);
    } catch (error) {
        handleError(res, error);
    }
});

module.exports = UserController;