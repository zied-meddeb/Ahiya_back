"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.catalogueService = void 0;
const Catalogue_1 = require("../entities/Catalogue");
const ErrorResponse_1 = require("../utils/ErrorResponse");
exports.catalogueService = {
    // Get all catalogues for a fournisseur
    getCataloguesByFournisseur: async (fournisseurId) => {
        try {
            const catalogues = await Catalogue_1.Catalogue.find({ Fournisseur: fournisseurId })
                .sort({ createdDate: -1 })
                .populate('Fournisseur', 'nom email');
            return { success: true, data: catalogues };
        }
        catch (error) {
            console.error('Error fetching catalogues:', error);
            throw new ErrorResponse_1.ServiceError(error.message, 500);
        }
    },
    // Get a single catalogue by ID
    getCatalogueById: async (catalogueId) => {
        try {
            const catalogue = await Catalogue_1.Catalogue.findById(catalogueId)
                .populate('Fournisseur', 'nom email');
            if (!catalogue) {
                throw new ErrorResponse_1.ServiceError('Catalogue not found', 404);
            }
            return { success: true, data: catalogue };
        }
        catch (error) {
            console.error('Error fetching catalogue:', error);
            if (error instanceof ErrorResponse_1.ServiceError) {
                throw error;
            }
            throw new ErrorResponse_1.ServiceError(error.message, 500);
        }
    },
    // Create a new catalogue
    createCatalogue: async (catalogueData) => {
        try {
            const catalogue = new Catalogue_1.Catalogue(catalogueData);
            await catalogue.save();
            const populatedCatalogue = await Catalogue_1.Catalogue.findById(catalogue._id)
                .populate('Fournisseur', 'nom email');
            return { success: true, data: populatedCatalogue };
        }
        catch (error) {
            console.error('Error creating catalogue:', error);
            throw new ErrorResponse_1.ServiceError(error.message, 500);
        }
    },
    // Update a catalogue
    updateCatalogue: async (catalogueId, updateData) => {
        try {
            const catalogue = await Catalogue_1.Catalogue.findByIdAndUpdate(catalogueId, { ...updateData, updatedDate: new Date() }, { new: true, runValidators: true }).populate('Fournisseur', 'nom email');
            if (!catalogue) {
                throw new ErrorResponse_1.ServiceError('Catalogue not found', 404);
            }
            return { success: true, data: catalogue };
        }
        catch (error) {
            console.error('Error updating catalogue:', error);
            if (error instanceof ErrorResponse_1.ServiceError) {
                throw error;
            }
            throw new ErrorResponse_1.ServiceError(error.message, 500);
        }
    },
    // Delete a catalogue
    deleteCatalogue: async (catalogueId) => {
        try {
            const catalogue = await Catalogue_1.Catalogue.findByIdAndDelete(catalogueId);
            if (!catalogue) {
                throw new ErrorResponse_1.ServiceError('Catalogue not found', 404);
            }
            return { success: true, data: catalogue };
        }
        catch (error) {
            console.error('Error deleting catalogue:', error);
            if (error instanceof ErrorResponse_1.ServiceError) {
                throw error;
            }
            throw new ErrorResponse_1.ServiceError(error.message, 500);
        }
    },
    // Add a page to a catalogue
    addPageToCatalogue: async (catalogueId, pageData) => {
        try {
            const catalogue = await Catalogue_1.Catalogue.findById(catalogueId);
            if (!catalogue) {
                throw new ErrorResponse_1.ServiceError('Catalogue not found', 404);
            }
            const newPage = {
                imageUrl: pageData.imageUrl,
                uploadDate: new Date(),
                pageNumber: catalogue.pages.length + 1,
            };
            catalogue.pages.push(newPage);
            await catalogue.save();
            const updatedCatalogue = await Catalogue_1.Catalogue.findById(catalogueId)
                .populate('Fournisseur', 'nom email');
            return { success: true, data: updatedCatalogue };
        }
        catch (error) {
            console.error('Error adding page to catalogue:', error);
            if (error instanceof ErrorResponse_1.ServiceError) {
                throw error;
            }
            throw new ErrorResponse_1.ServiceError(error.message, 500);
        }
    },
    // Remove a page from a catalogue
    removePageFromCatalogue: async (catalogueId, pageIndex) => {
        try {
            const catalogue = await Catalogue_1.Catalogue.findById(catalogueId);
            if (!catalogue) {
                throw new ErrorResponse_1.ServiceError('Catalogue not found', 404);
            }
            if (pageIndex < 0 || pageIndex >= catalogue.pages.length) {
                throw new ErrorResponse_1.ServiceError('Invalid page index', 400);
            }
            // Remove the page
            catalogue.pages.splice(pageIndex, 1);
            // Update page numbers
            catalogue.pages.forEach((page, index) => {
                page.pageNumber = index + 1;
            });
            await catalogue.save();
            const updatedCatalogue = await Catalogue_1.Catalogue.findById(catalogueId)
                .populate('Fournisseur', 'nom email');
            return { success: true, data: updatedCatalogue };
        }
        catch (error) {
            console.error('Error removing page from catalogue:', error);
            if (error instanceof ErrorResponse_1.ServiceError) {
                throw error;
            }
            throw new ErrorResponse_1.ServiceError(error.message, 500);
        }
    },
};
//# sourceMappingURL=CatalogueService.js.map