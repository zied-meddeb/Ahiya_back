import { IVerificateur, Verificateur } from '../entities/Verificateur';
import { createToken } from '../config/token';
import { Types } from 'mongoose';
import { ServiceError } from '../bean/ErrorResponse';

interface VerificateurResponse {
    success: boolean;
    message?: string;
    data?: IVerificateur | IVerificateur[] | { user: IVerificateur, token: string } ;
}

export const verificateurService = {
    getAllVerificateurs: async (): Promise<VerificateurResponse> => {
        try {
            const verificateurs = await Verificateur.find();
            return {success:true, data: verificateurs };
        } catch (error:any) {
            throw new ServiceError(error instanceof Error ? error.message : 'Unknown error', 500);
        }
    },

    getVerificateurById: async (id: string): Promise<VerificateurResponse> => {
        try {
            if (!Types.ObjectId.isValid(id)) {
                throw new ServiceError('Invalid verificateur ID format', 400);
            }

            const verificateur = await Verificateur.findById(id);
            if (!verificateur) {
                throw new ServiceError('Verificateur not found', 404);
            }
            return {success:true, data: verificateur };
        } catch (error:any) {
            throw new ServiceError(error instanceof Error ? error.message : 'Unknown error', 500);
        }
    },

    createVerificateur: async (verificateurData: Partial<IVerificateur>): Promise<VerificateurResponse> => {
        try {
            const existingVerificateur = await Verificateur.findOne({ email: verificateurData.email });
            if (existingVerificateur) {
                throw new ServiceError('Verificateur with this email already exists', 409);
            }

            const verificateur = new Verificateur(verificateurData);
            await verificateur.save();
            const jwtToken = createToken(verificateur);
            
            return { 
                success:true,
                data: {
                    user: verificateur,
                    token: jwtToken
                }
            };
        } catch (error:any) {
            throw new ServiceError(error instanceof Error ? error.message : 'Unknown error', 500);
        }
    },

    updateVerificateur: async (id: string, verificateurData: Partial<IVerificateur>): Promise<VerificateurResponse> => {
        try {
            if (!Types.ObjectId.isValid(id)) {
                throw new ServiceError('Invalid verificateur ID format', 400);
            }

            const verificateur = await Verificateur.findByIdAndUpdate(id, verificateurData, { new: true });
            if (!verificateur) {
                throw new ServiceError('Verificateur not found', 404);
            }
            return { success:true,data: verificateur };
        } catch (error:any) {
            throw new ServiceError(error instanceof Error ? error.message : 'Unknown error', 500);
        }
    },

    deleteVerificateur: async (id: string): Promise<VerificateurResponse> => {
        try {
            if (!Types.ObjectId.isValid(id)) {
                throw new ServiceError('Invalid verificateur ID format', 400);
            }

            const verificateur = await Verificateur.findByIdAndDelete(id);
            if (!verificateur) {
                throw new ServiceError('Verificateur not found', 404);
            }
            return { success:true,data: verificateur };
        } catch (error:any) {
            throw new ServiceError(error instanceof Error ? error.message : 'Unknown error', 500);
        }
    },

    loginVerificateur: async (email: string, password: string): Promise<VerificateurResponse> => {
        try {
            const verificateur = await Verificateur.findOne({ email, password });
            if (!verificateur) {
                throw new ServiceError('Verificateur not found', 404);
            }

            const jwtToken = createToken(verificateur);
            return {
                success:true,
                data: {
                    user: verificateur,
                    token: jwtToken
                }
            };
        } catch (error:any) {
            throw new ServiceError(error instanceof Error ? error.message : 'Unknown error', 500);
        }
    },

    changePassword: async (id: string, newPassword: string): Promise<VerificateurResponse> => {
        try {
            if (!Types.ObjectId.isValid(id)) {
                throw new ServiceError('Invalid verificateur ID format', 400);
            }

            const verificateur = await Verificateur.findByIdAndUpdate(
                id, 
                { password: newPassword }, 
                { new: true }
            );
            
            if (!verificateur) {
                throw new ServiceError('Verificateur not found', 404);
            }
            return { success:true,data: verificateur };
        } catch (error:any) {
            throw new ServiceError(error instanceof Error ? error.message : 'Unknown error', 500);
        }
    },

    // verifierProduit: async (id: string, verifId: string): Promise<VerificateurResponse> => {
    //     try {
    //         if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(verifId)) {
    //             throw new ServiceError('Invalid product or verificateur ID format', 400);
    //         }

    //         const produit = await Produit.findById(id);
    //         if (!produit) {
    //             throw new ServiceError('Product not found', 404);
    //         }

    //         const verificateur = await Verificateur.findById(verifId);
    //         if (!verificateur) {
    //             throw new ServiceError('Verificateur not found', 404);
    //         }

    //         produit.verified = true;
    //         produit.checked_by = new Types.ObjectId(verifId);
    //         await produit.save();
            
    //         return { data: produit };
    //     } catch (error:any) {
    //         throw new ServiceError(error instanceof Error ? error.message : 'Unknown error', 500);
    //     }
    // },

    // rejeterProduit: async (id: string, verifId: string): Promise<VerificateurResponse> => {
    //     try {
    //         if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(verifId)) {
    //             throw new ServiceError('Invalid product or verificateur ID format', 400);
    //         }

    //         const produit = await Produit.findById(id);
    //         if (!produit) {
    //             throw new ServiceError('Product not found', 404);
    //         }

    //         const verificateur = await Verificateur.findById(verifId);
    //         if (!verificateur) {
    //             throw new ServiceError('Verificateur not found', 404);
    //         }

    //         produit.verified = false;
    //         produit.checked_by = new Types.ObjectId(verifId);
    //         await produit.save();
            
    //         return { data: produit };
    //     } catch (error:any) {
    //         throw new ServiceError(error instanceof Error ? error.message : 'Unknown error', 500);
    //     }
    // }
};

export default verificateurService;