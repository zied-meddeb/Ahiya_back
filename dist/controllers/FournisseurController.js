"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const FournisseurService_1 = require("../services/FournisseurService");
const middleware_1 = require("../config/middleware");
const responseHandler_1 = require("../utils/responseHandler");
const FournisseurController = express_1.default.Router();
FournisseurController.get(`/`, middleware_1.verifyToken, async (req, res) => {
    try {
        const response = await FournisseurService_1.fournisseurService.getAllFournisseurs();
        (0, responseHandler_1.handleResponse)(res, response);
    }
    catch (error) {
        (0, responseHandler_1.handleError)(res, error);
    }
});
FournisseurController.get(`/:id`, middleware_1.verifyToken, async (req, res) => {
    try {
        const response = await FournisseurService_1.fournisseurService.getFournisseurById(req.params.id);
        (0, responseHandler_1.handleResponse)(res, response);
    }
    catch (error) {
        (0, responseHandler_1.handleError)(res, error);
    }
});
FournisseurController.post(`/`, async (req, res) => {
    try {
        const response = await FournisseurService_1.fournisseurService.createFournisseur(req.body);
        (0, responseHandler_1.handleResponse)(res, response);
    }
    catch (error) {
        (0, responseHandler_1.handleError)(res, error);
    }
});
FournisseurController.put(`/:id`, middleware_1.verifyToken, async (req, res) => {
    try {
        const response = await FournisseurService_1.fournisseurService.updateFournisseur(req.params.id, req.body);
        (0, responseHandler_1.handleResponse)(res, response);
    }
    catch (error) {
        (0, responseHandler_1.handleError)(res, error);
    }
});
FournisseurController.delete(`/:id`, middleware_1.verifyToken, async (req, res) => {
    try {
        const response = await FournisseurService_1.fournisseurService.deleteFournisseur(req.params.id);
        (0, responseHandler_1.handleResponse)(res, response);
    }
    catch (error) {
        (0, responseHandler_1.handleError)(res, error);
    }
});
FournisseurController.post(`/auth/login`, async (req, res) => {
    try {
        const { email, password } = req.body;
        const response = await FournisseurService_1.fournisseurService.loginFournisseur(email, password);
        (0, responseHandler_1.handleResponse)(res, response);
    }
    catch (error) {
        (0, responseHandler_1.handleError)(res, error);
    }
});
exports.default = FournisseurController;
