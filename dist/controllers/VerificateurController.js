"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const VerificateurService_1 = __importDefault(require("../services/VerificateurService"));
const middleware_1 = require("../config/middleware");
const responseHandler_1 = require("../utils/responseHandler");
const VerficateurController = express_1.default.Router();
VerficateurController.get(`/`, middleware_1.verifyToken, async (req, res) => {
    try {
        const verificateurs = await VerificateurService_1.default.getAllVerificateurs();
        (0, responseHandler_1.handleResponse)(res, verificateurs);
    }
    catch (error) {
        (0, responseHandler_1.handleError)(res, error);
    }
});
VerficateurController.get(`/:id`, middleware_1.verifyToken, async (req, res) => {
    try {
        const verificateur = await VerificateurService_1.default.getVerificateurById(req.params.id);
        (0, responseHandler_1.handleResponse)(res, verificateur);
    }
    catch (error) {
        (0, responseHandler_1.handleError)(res, error);
    }
});
VerficateurController.put(`/:id`, middleware_1.verifyToken, async (req, res) => {
    try {
        const verificateur = await VerificateurService_1.default.updateVerificateur(req.params.id, req.body);
        (0, responseHandler_1.handleResponse)(res, verificateur);
    }
    catch (error) {
        (0, responseHandler_1.handleError)(res, error);
    }
});
VerficateurController.delete(`/:id`, middleware_1.verifyToken, async (req, res) => {
    try {
        const verificateur = await VerificateurService_1.default.deleteVerificateur(req.params.id);
        (0, responseHandler_1.handleResponse)(res, verificateur);
    }
    catch (error) {
        (0, responseHandler_1.handleError)(res, error);
    }
});
VerficateurController.post(`/auth/login`, async (req, res) => {
    try {
        const { email, password } = req.body;
        const verificateur = await VerificateurService_1.default.loginVerificateur(email, password);
        if (!verificateur) {
            return (0, responseHandler_1.handleError)(res, new Error('Invalid credentials'));
        }
        (0, responseHandler_1.handleResponse)(res, verificateur);
    }
    catch (error) {
        (0, responseHandler_1.handleError)(res, error);
    }
});
VerficateurController.post(`/auth/register`, async (req, res) => {
    try {
        const verificateur = await VerificateurService_1.default.createVerificateur(req.body);
        (0, responseHandler_1.handleResponse)(res, verificateur);
    }
    catch (error) {
        (0, responseHandler_1.handleError)(res, error);
    }
});
exports.default = VerficateurController;
