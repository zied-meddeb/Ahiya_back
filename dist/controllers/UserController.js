"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const UserService_1 = __importDefault(require("../services/UserService"));
const middleware_1 = require("../middleware/middleware");
const crypto_1 = __importDefault(require("crypto"));
const responseHandler_1 = require("../utils/responseHandler");
const UserController = express_1.default.Router();
UserController.get('/', middleware_1.verifyToken, async (req, res) => {
    try {
        const response = await UserService_1.default.getAllUsers();
        (0, responseHandler_1.handleResponse)(res, response);
    }
    catch (error) {
        (0, responseHandler_1.handleError)(res, error);
    }
});
UserController.get('/:id', middleware_1.verifyToken, async (req, res) => {
    try {
        const response = await UserService_1.default.getUserById(req.params.id);
        (0, responseHandler_1.handleResponse)(res, response);
    }
    catch (error) {
        (0, responseHandler_1.handleError)(res, error);
    }
});
UserController.post('/', async (req, res) => {
    try {
        if (!req.body.email || !req.body.password) {
            return (0, responseHandler_1.handleError)(res, {
                statusCode: 400,
                message: 'Email and password are required'
            });
        }
        const response = await UserService_1.default.createUser(req.body);
        (0, responseHandler_1.handleResponse)(res, response, 201);
    }
    catch (error) {
        (0, responseHandler_1.handleError)(res, error);
    }
});
UserController.put('/:id', middleware_1.verifyToken, async (req, res) => {
    try {
        const response = await UserService_1.default.updateUser(req.params.id, req.body);
        (0, responseHandler_1.handleResponse)(res, response);
    }
    catch (error) {
        (0, responseHandler_1.handleError)(res, error);
    }
});
UserController.delete('/:id', middleware_1.verifyToken, async (req, res) => {
    try {
        const response = await UserService_1.default.deleteUser(req.params.id);
        (0, responseHandler_1.handleResponse)(res, response);
    }
    catch (error) {
        (0, responseHandler_1.handleError)(res, error);
    }
});
UserController.delete('/not-verified/user', async (req, res) => {
    try {
        const response = await UserService_1.default.deleteUnverifiedUser(req.body.email);
        (0, responseHandler_1.handleResponse)(res, response);
    }
    catch (error) {
        (0, responseHandler_1.handleError)(res, error);
    }
});
UserController.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return (0, responseHandler_1.handleError)(res, {
                statusCode: 400,
                message: 'Email and password are required'
            });
        }
        const response = await UserService_1.default.loginUser(email, password);
        (0, responseHandler_1.handleResponse)(res, response);
    }
    catch (error) {
        (0, responseHandler_1.handleError)(res, error);
    }
});
UserController.post('/auth/verify', async (req, res) => {
    try {
        const { email, code } = req.body;
        if (!email || !code) {
            return (0, responseHandler_1.handleError)(res, {
                statusCode: 400,
                message: 'Email and verification code are required'
            });
        }
        const response = await UserService_1.default.verifyEmail(email, code);
        (0, responseHandler_1.handleResponse)(res, response);
    }
    catch (error) {
        (0, responseHandler_1.handleError)(res, error);
    }
});
UserController.put('/preferences/:id', middleware_1.verifyToken, async (req, res) => {
    try {
        const response = await UserService_1.default.updateUserPreferences(req.params.id, req.body);
        (0, responseHandler_1.handleResponse)(res, response);
    }
    catch (error) {
        (0, responseHandler_1.handleError)(res, error);
    }
});
UserController.get('/preferences/:id', middleware_1.verifyToken, async (req, res) => {
    try {
        const response = await UserService_1.default.getUserPreferences(req.params.id);
        (0, responseHandler_1.handleResponse)(res, response);
    }
    catch (error) {
        (0, responseHandler_1.handleError)(res, error);
    }
});
UserController.put('/history/:id', middleware_1.verifyToken, async (req, res) => {
    try {
        if (!req.body.query) {
            return (0, responseHandler_1.handleError)(res, {
                statusCode: 400,
                message: 'Search query is required'
            });
        }
        const response = await UserService_1.default.addToSearchHistory(req.params.id, req.body.query);
        (0, responseHandler_1.handleResponse)(res, response);
    }
    catch (error) {
        (0, responseHandler_1.handleError)(res, error);
    }
});
UserController.put('/last-views/:id/:prodId', middleware_1.verifyToken, async (req, res) => {
    try {
        const response = await UserService_1.default.trackProductView(req.params.id, req.params.prodId);
        (0, responseHandler_1.handleResponse)(res, response);
    }
    catch (error) {
        (0, responseHandler_1.handleError)(res, error);
    }
});
UserController.get('/last-views/:id', middleware_1.verifyToken, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5;
        const response = await UserService_1.default.getRecentViews(req.params.id, limit);
        (0, responseHandler_1.handleResponse)(res, response);
    }
    catch (error) {
        (0, responseHandler_1.handleError)(res, error);
    }
});
UserController.post('/send-verification-code', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return (0, responseHandler_1.handleError)(res, {
                statusCode: 400,
                message: 'Email is required'
            });
        }
        const verificationCode = crypto_1.default.randomInt(100000, 999999).toString();
        const response = await UserService_1.default.sendVerificationEmail(email, verificationCode);
        (0, responseHandler_1.handleResponse)(res, response);
    }
    catch (error) {
        (0, responseHandler_1.handleError)(res, error);
    }
});
exports.default = UserController;
//# sourceMappingURL=UserController.js.map