import express, { Request, Response, Router } from "express";
import { produitService } from "../services/ProduitService";
import { verifyToken } from "../middleware/middleware";
import { handleResponse, handleError } from "../utils/responseHandler";
import { uploadImageToCloudinary } from "../middleware/upload";

const ProduitController: Router = express.Router();

ProduitController.get("/", async (req: Request, res: Response) => {
  try {
    const response = await produitService.getAllProduits();
    handleResponse(res, response);
  } catch (error: any) {
    handleError(res, error);
  }
});

ProduitController.get("/:id", async (req: Request, res: Response) => {
  try {
    const response = await produitService.getProduitById(req.params.id);
    handleResponse(res, response);
  } catch (error: any) {
    handleError(res, error);
  }
});

ProduitController.post(
  "/",
  verifyToken,
  uploadImageToCloudinary("image"),
  async (req: any, res: Response) => {
    try {
      if (req.uploadedImageUrl) {
        req.body.imageUrl = req.uploadedImageUrl;
      }
      if (
        !req.body.nom ||
        !req.body.prix ||
        !req.body.category ||
        !req.body.fournisseur
      ) {
        return handleError(res, {
          statusCode: 400,
          message: "Name, price, category and supplier are required",
        });
      }

      const response = await produitService.createProduit(req.body);
      handleResponse(res, response, 201);
    } catch (error: any) {
      handleError(res, error);
    }
  }
);

ProduitController.put(
  "/:id",
  verifyToken,
  uploadImageToCloudinary("image"),
  async (req: any, res: Response) => {
    try {
      if (req.uploadedImageUrl) {
        req.body.imageUrl = req.uploadedImageUrl;
      }
      const response = await produitService.updateProduit(
        req.params.id,
        req.body
      );
      handleResponse(res, response);
    } catch (error: any) {
      handleError(res, error);
    }
  }
);

ProduitController.delete(
  "/:id",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const response = await produitService.deleteProduit(req.params.id);
      handleResponse(res, response);
    } catch (error: any) {
      handleError(res, error);
    }
  }
);

ProduitController.get(
  "/search/criteria",
  async (req: Request, res: Response) => {
    try {
      const criteria = req.query;
      const response = await produitService.searchByCriteria(criteria);
      handleResponse(res, response);
    } catch (error: any) {
      handleError(res, error);
    }
  }
);

ProduitController.get(
  "/category/:categoryId",
  async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const response = await produitService.getProductsByCategory(
        req.params.categoryId,
        limit
      );
      handleResponse(res, response);
    } catch (error: any) {
      handleError(res, error);
    }
  }
);

ProduitController.get(
  "/search/popular",
  async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const response = await produitService.getPopularProducts(limit);
      handleResponse(res, response);
    } catch (error: any) {
      handleError(res, error);
    }
  }
);

ProduitController.get(
  "/byfournisseur/:fournisseurId",
  async (req: Request, res: Response) => {
    try {
      const response = await produitService.getProductsByFournisseur(
        req.params.fournisseurId
      );
      handleResponse(res, response);
    } catch (error: any) {
      handleError(res, error);
    }
  }
);

ProduitController.put("/views/:id", async (req: Request, res: Response) => {
  try {
    const response = await produitService.incrementProductViews(req.params.id);
    handleResponse(res, response);
  } catch (error: any) {
    handleError(res, error);
  }
});

ProduitController.get("/best-discount", async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const response = await produitService.getBestDiscounts(limit);
    handleResponse(res, response);
  } catch (error: any) {
    handleError(res, error);
  }
});

ProduitController.get(
  "/current-promotions",
  async (req: Request, res: Response) => {
    try {
      const response = await produitService.getCurrentPromotions();
      handleResponse(res, response);
    } catch (error: any) {
      handleError(res, error);
    }
  }
);

export default ProduitController;
