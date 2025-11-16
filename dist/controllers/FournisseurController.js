"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const FournisseurService_1 = require("../services/FournisseurService");
const middleware_1 = require("../middleware/middleware");
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
FournisseurController.get(`/profile`, middleware_1.verifyToken, async (req, res) => {
    try {
        const response = await FournisseurService_1.fournisseurService.getFournisseurById(req.user?.id);
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
FournisseurController.post("/auth/verify", async (req, res) => {
    try {
        const { email, code } = req.body;
        if (!email || !code) {
            return (0, responseHandler_1.handleError)(res, {
                statusCode: 400,
                message: "Email and verification code are required",
            });
        }
        const response = await FournisseurService_1.fournisseurService.verifyEmail(email, code);
        (0, responseHandler_1.handleResponse)(res, response);
    }
    catch (error) {
        (0, responseHandler_1.handleError)(res, error);
    }
});
// Address management endpoints
FournisseurController.post("/addresses", middleware_1.verifyToken, middleware_1.verifyFournisseurRole, async (req, res) => {
    try {
        const fournisseurId = req.user?.id;
        if (!fournisseurId) {
            return (0, responseHandler_1.handleError)(res, {
                statusCode: 401,
                message: "User not authenticated",
            });
        }
        const response = await FournisseurService_1.fournisseurService.addAddress(fournisseurId, req.body);
        (0, responseHandler_1.handleResponse)(res, response);
    }
    catch (error) {
        (0, responseHandler_1.handleError)(res, error);
    }
});
FournisseurController.put("/addresses/:addressId", middleware_1.verifyToken, middleware_1.verifyFournisseurRole, async (req, res) => {
    try {
        const fournisseurId = req.user?.id;
        const { addressId } = req.params;
        if (!fournisseurId) {
            return (0, responseHandler_1.handleError)(res, {
                statusCode: 401,
                message: "User not authenticated",
            });
        }
        const response = await FournisseurService_1.fournisseurService.updateAddress(fournisseurId, addressId, req.body);
        (0, responseHandler_1.handleResponse)(res, response);
    }
    catch (error) {
        (0, responseHandler_1.handleError)(res, error);
    }
});
FournisseurController.delete("/addresses/:addressId", middleware_1.verifyToken, middleware_1.verifyFournisseurRole, async (req, res) => {
    try {
        const fournisseurId = req.user?.id;
        const { addressId } = req.params;
        if (!fournisseurId) {
            return (0, responseHandler_1.handleError)(res, {
                statusCode: 401,
                message: "User not authenticated",
            });
        }
        const response = await FournisseurService_1.fournisseurService.deleteAddress(fournisseurId, addressId);
        (0, responseHandler_1.handleResponse)(res, response);
    }
    catch (error) {
        (0, responseHandler_1.handleError)(res, error);
    }
});
// Onboarding endpoints
FournisseurController.post("/onboarding/complete", middleware_1.verifyToken, middleware_1.verifyFournisseurRole, async (req, res) => {
    try {
        const fournisseurId = req.user?.id;
        if (!fournisseurId) {
            return (0, responseHandler_1.handleError)(res, {
                statusCode: 401,
                message: "User not authenticated",
            });
        }
        const response = await FournisseurService_1.fournisseurService.completeOnboarding(fournisseurId, req.body);
        (0, responseHandler_1.handleResponse)(res, response);
    }
    catch (error) {
        (0, responseHandler_1.handleError)(res, error);
    }
});
FournisseurController.get("/onboarding/status", middleware_1.verifyToken, middleware_1.verifyFournisseurRole, async (req, res) => {
    try {
        const fournisseurId = req.user?.id;
        if (!fournisseurId) {
            return (0, responseHandler_1.handleError)(res, {
                statusCode: 401,
                message: "User not authenticated",
            });
        }
        const response = await FournisseurService_1.fournisseurService.getOnboardingStatus(fournisseurId);
        (0, responseHandler_1.handleResponse)(res, response);
    }
    catch (error) {
        (0, responseHandler_1.handleError)(res, error);
    }
});
exports.default = FournisseurController;
//# sourceMappingURL=FournisseurController.js.map