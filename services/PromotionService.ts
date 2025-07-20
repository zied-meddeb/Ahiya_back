import { IPromotion,Promotion } from '../entities/Promotion';
import { ServiceError } from '../bean/ErrorResponse';

interface PromotionResponse {
    success: boolean;
    message?: string;
    data?: IPromotion | IPromotion[];
}

export const promotionService = {
    getAllPromotions: async (): Promise<PromotionResponse> => {
        try {
            const promotions = await Promotion.find();
            return { success:true,data: promotions };
        } catch (error:any) {
            throw new ServiceError(error.message, 500);
        }
    },

    getPromotionById: async (id: string): Promise<PromotionResponse> => {
        try {
            const promotion = await Promotion.findById(id);
            if (!promotion) {
                throw new ServiceError('Promotion not found', 404);
            }
            return {success:true, data: promotion };
        } catch (error:any) {
            throw new ServiceError(error.message, 500);
        }
    },

    createPromotion: async (promotionData: Partial<IPromotion>): Promise<PromotionResponse> => {
        try {
            const promotion = new Promotion(promotionData);
            await promotion.save();
            return {success:true, data: promotion };
        } catch (error:any) {
            throw new ServiceError(error.message, 500);
        }
    },

    updatePromotion: async (id: string, promotionData: Partial<IPromotion>): Promise<PromotionResponse> => {
        try {
            const promotion = await Promotion.findByIdAndUpdate(id, promotionData, { new: true });
            if (!promotion) {
                throw new ServiceError('Promotion not found', 404);
            }
            return {success:true, data: promotion };
        } catch (error:any) {
            throw new ServiceError(error.message, 500);
        }
    },

    deletePromotion: async (id: string): Promise<PromotionResponse> => {
        try {
            const promotion = await Promotion.findByIdAndDelete(id);
            if (!promotion) {
                throw new ServiceError('Promotion not found', 404);
            }
            return {success:true, data: promotion };
        } catch (error:any) {
            throw new ServiceError(error.message, 500);
        }
    },

    changeOffreStatus: async (id: string, statut: string): Promise<PromotionResponse> => {
        try {
            const promotion = await Promotion.findByIdAndUpdate(id, { statut }, { new: true });
            if (!promotion) {
                throw new ServiceError('Promotion not found', 404);
            } 
            return {success:true, data: promotion };
        } catch (error:any) {
            throw new ServiceError(error.message, 500);
        }
    },

    getPromotionsByFournisseur: async (fournisseurId: string): Promise<PromotionResponse> => {
        try {
            const promotions = await Promotion.find({ 'produits.fournisseur': fournisseurId });
            return {success:true, data: promotions };
        } catch (error:any) {
            throw new ServiceError(error.message, 500);
        }
    }

};


