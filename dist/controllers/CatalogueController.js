"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const CatalogueService_1 = require("../services/CatalogueService");
const middleware_1 = require("../middleware/middleware");
const responseHandler_1 = require("../utils/responseHandler");
const upload_1 = require("../middleware/upload");
const CatalogueController = express_1.default.Router();
// Get all catalogues for a fournisseur
CatalogueController.get(`/fournisseur/:fournisseurId`, async (req, res) => {
    try {
        const fournisseurId = req.params.fournisseurId;
        const result = await CatalogueService_1.catalogueService.getCataloguesByFournisseur(fournisseurId);
        (0, responseHandler_1.handleResponse)(res, result);
    }
    catch (error) {
        (0, responseHandler_1.handleError)(res, error);
    }
});
// Get a single catalogue by ID
CatalogueController.get(`/:id`, async (req, res) => {
    try {
        const catalogueId = req.params.id;
        const result = await CatalogueService_1.catalogueService.getCatalogueById(catalogueId);
        (0, responseHandler_1.handleResponse)(res, result);
    }
    catch (error) {
        (0, responseHandler_1.handleError)(res, error);
    }
});
// Create a new catalogue
CatalogueController.post(`/`, middleware_1.verifyToken, async (req, res) => {
    try {
        const catalogueData = {
            Fournisseur: req.body.Fournisseur,
            name: req.body.name,
            pages: [],
            pageCount: 0,
        };
        const result = await CatalogueService_1.catalogueService.createCatalogue(catalogueData);
        (0, responseHandler_1.handleResponse)(res, result);
    }
    catch (error) {
        (0, responseHandler_1.handleError)(res, error);
    }
});
// Update a catalogue
CatalogueController.put(`/:id`, middleware_1.verifyToken, async (req, res) => {
    try {
        const catalogueId = req.params.id;
        const updateData = req.body;
        const result = await CatalogueService_1.catalogueService.updateCatalogue(catalogueId, updateData);
        (0, responseHandler_1.handleResponse)(res, result);
    }
    catch (error) {
        (0, responseHandler_1.handleError)(res, error);
    }
});
// Delete a catalogue
CatalogueController.delete(`/:id`, middleware_1.verifyToken, async (req, res) => {
    try {
        const catalogueId = req.params.id;
        const result = await CatalogueService_1.catalogueService.deleteCatalogue(catalogueId);
        (0, responseHandler_1.handleResponse)(res, result);
    }
    catch (error) {
        (0, responseHandler_1.handleError)(res, error);
    }
});
// Add a page to a catalogue
CatalogueController.post(`/:id/pages`, middleware_1.verifyToken, ...(0, upload_1.uploadImageToCloudinary)('image'), async (req, res) => {
    try {
        const catalogueId = req.params.id;
        const imageUrl = req.uploadedImageUrl || req.body.imageUrl;
        if (!imageUrl) {
            return res.status(400).json({
                success: false,
                message: 'Image is required',
            });
        }
        const result = await CatalogueService_1.catalogueService.addPageToCatalogue(catalogueId, { imageUrl });
        (0, responseHandler_1.handleResponse)(res, result);
    }
    catch (error) {
        (0, responseHandler_1.handleError)(res, error);
    }
});
// Remove a page from a catalogue
CatalogueController.delete(`/:id/pages/:pageIndex`, middleware_1.verifyToken, async (req, res) => {
    try {
        const catalogueId = req.params.id;
        const pageIndex = parseInt(req.params.pageIndex);
        if (isNaN(pageIndex)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid page index',
            });
        }
        const result = await CatalogueService_1.catalogueService.removePageFromCatalogue(catalogueId, pageIndex);
        (0, responseHandler_1.handleResponse)(res, result);
    }
    catch (error) {
        (0, responseHandler_1.handleError)(res, error);
    }
});
exports.default = CatalogueController;
//# sourceMappingURL=CatalogueController.js.map