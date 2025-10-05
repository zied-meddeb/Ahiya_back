import express, { Request, Response, Router } from "express";
import { catalogueService } from "../services/CatalogueService";
import { verifyToken } from "../middleware/middleware";
import { handleResponse, handleError } from "../utils/responseHandler";
import { uploadImageToCloudinary } from "../middleware/upload";

const CatalogueController: Router = express.Router();

// Get all catalogues for a fournisseur
CatalogueController.get(`/fournisseur/:fournisseurId`, async (req: Request, res: Response) => {
  try {
    const fournisseurId = req.params.fournisseurId;
    const result = await catalogueService.getCataloguesByFournisseur(fournisseurId);
    handleResponse(res, result);
  } catch (error: any) {
    handleError(res, error);
  }
});

// Get a single catalogue by ID
CatalogueController.get(`/:id`, async (req: Request, res: Response) => {
  try {
    const catalogueId = req.params.id;
    const result = await catalogueService.getCatalogueById(catalogueId);
    handleResponse(res, result);
  } catch (error: any) {
    handleError(res, error);
  }
});

// Create a new catalogue
CatalogueController.post(`/`, verifyToken, async (req: Request, res: Response) => {
  try {
    const catalogueData = {
      Fournisseur: req.body.Fournisseur,
      name: req.body.name,
      pages: [],
      pageCount: 0,
    };

    const result = await catalogueService.createCatalogue(catalogueData);
    handleResponse(res, result);
  } catch (error: any) {
    handleError(res, error);
  }
});

// Update a catalogue
CatalogueController.put(`/:id`, verifyToken, async (req: Request, res: Response) => {
  try {
    const catalogueId = req.params.id;
    const updateData = req.body;

    const result = await catalogueService.updateCatalogue(catalogueId, updateData);
    handleResponse(res, result);
  } catch (error: any) {
    handleError(res, error);
  }
});

// Delete a catalogue
CatalogueController.delete(`/:id`, verifyToken, async (req: Request, res: Response) => {
  try {
    const catalogueId = req.params.id;
    const result = await catalogueService.deleteCatalogue(catalogueId);
    handleResponse(res, result);
  } catch (error: any) {
    handleError(res, error);
  }
});

// Add a page to a catalogue
CatalogueController.post(`/:id/pages`, verifyToken, ...uploadImageToCloudinary('image'), async (req: Request, res: Response) => {
  try {
    const catalogueId = req.params.id;
    const imageUrl = (req as any).uploadedImageUrl || req.body.imageUrl;

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Image is required',
      });
    }

    const result = await catalogueService.addPageToCatalogue(catalogueId, { imageUrl });
    handleResponse(res, result);
  } catch (error: any) {
    handleError(res, error);
  }
});

// Remove a page from a catalogue
CatalogueController.delete(`/:id/pages/:pageIndex`, verifyToken, async (req: Request, res: Response) => {
  try {
    const catalogueId = req.params.id;
    const pageIndex = parseInt(req.params.pageIndex);

    if (isNaN(pageIndex)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid page index',
      });
    }

    const result = await catalogueService.removePageFromCatalogue(catalogueId, pageIndex);
    handleResponse(res, result);
  } catch (error: any) {
    handleError(res, error);
  }
});

export default CatalogueController;
