import express, { Request, Response, Router } from "express";
import { promotionService } from "../services/PromotionService";
import { verifyToken } from "../middleware/middleware";
import { handleResponse, handleError } from "../utils/responseHandler";
import { uploadImageToCloudinary } from "../middleware/upload";
import { JwtPayload } from "jsonwebtoken";

const PromotionController: Router = express.Router();

PromotionController.get(`/`, async (req: Request, res: Response) => {
  try {
    const promotions = await promotionService.getAllPromotions();
    handleResponse(res, promotions);
  } catch (error: any) {
    handleError(res, error);
  }
});

PromotionController.get(`/:id`, async (req: Request, res: Response) => {
  try {
    const promotion = await promotionService.getPromotionById(req.params.id);
    handleResponse(res, promotion);
  } catch (error: any) {
    handleError(res, error);
  }
});

// Get promotions by fournisseur ID
PromotionController.get(
  "/fournisseur/:fournisseurId",
  verifyToken,
  async (req: Request, res: Response) => {
    if (!req.params.fournisseurId) {
      return res.status(400).json({ message: "Fournisseur ID is required." });
    }
    try {
      const promotions = await promotionService.getPromotionsByFournisseur(
        req.params.fournisseurId
      );
      handleResponse(res, promotions);
    } catch (error: any) {
      handleError(res, error);
    }
  }
);

PromotionController.post(
  "/",

  uploadImageToCloudinary("affiche"),
  async (req: any, res: any) => {
    try {
      if (req.uploadedImageUrl) {
        req.body.afficheUrl = req.uploadedImageUrl;
      }
      if (typeof req.body.produits === "string") {
        try {
          req.body.produits = JSON.parse(req.body.produits);
        } catch (parseError) {
          return res.status(400).json({
            message: "Invalid JSON format for produits field",
            error:
              parseError instanceof Error
                ? parseError.message
                : String(parseError),
          });
        }
      }
      const promotion = await promotionService.createPromotion(req.body);
      handleResponse(res, promotion);
    } catch (error: any) {
      handleError(res, error);
    }
  }
);
PromotionController.put(
  `/:id`,
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const promotion = await promotionService.updatePromotion(
        req.params.id,
        req.body
      );
      handleResponse(res, promotion);
    } catch (error: any) {
      handleError(res, error);
    }
  }
);

PromotionController.delete(
  `/:id`,
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const promotion = await promotionService.deletePromotion(req.params.id);
      handleResponse(res, promotion);
    } catch (error: any) {
      handleError(res, error);
    }
  }
);

PromotionController.put(
  "/:id/changeStatus",
  verifyToken,
  async (req: Request & { user?: JwtPayload }, res: Response) => {
    const userRole = req.user?.role;

    if (!userRole) {
      return res
        .status(403)
        .json({ message: "Access denied. User role not found." });
    }
    if (!req.body.statut) {
      return res.status(400).json({ message: "Status is required." });
    }
    // check if status is valid
    const validStatuses = ["ATT_VER", "REJETE", "VALIDE", "ACTIVE"];
    if (!validStatuses.includes(req.body.statut)) {
      return res.status(400).json({ message: "Invalid status." });
    }

    // only verificateur can change status to REJETE or VALIDE (dans le cas ou le fournisseur a soumis la promotion et le verificateur veut la rejeter ou la valider)
    if (
      ["REJETE", "VALIDE"].includes(req.body.statut) &&
      userRole !== "verificateur"
    ) {
      return res.status(403).json({
        message:
          "Access denied. Only verificateurs can change status to REJETE or VALIDE.",
      });
    }

    // only fournisseur can change status to AcTIVE (dans le cas ou le verificateur a validé la promotion et le fournisseur veut l'activer apres paiement)
    if (req.body.statut === "ACTIVE" && userRole !== "fournisseur") {
      return res.status(403).json({
        message: "Access denied. Only fournisseur can activate promotions.",
      });
    }

    // only fournisseur can set status to ATT_VER (dans le cas ou le verificateur a rejeté la promotion et le fournisseur veut la soumettre à nouveau)
    if (req.body.statut === "ATT_VER" && userRole !== "fournisseur") {
      return res.status(403).json({
        message:
          "Access denied. Only fournisseur can set promotions to ATT_VER.",
      });
    }

    try {
      const promotion = await promotionService.changeOffreStatus(
        req.params.id,
        req.body.statut
      );
      handleResponse(res, promotion);
    } catch (error: any) {
      handleError(res, error);
    }
  }
);

export default PromotionController;
