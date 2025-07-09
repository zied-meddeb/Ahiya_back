"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verificateurService = void 0;
const Verificateur_1 = require("../entities/Verificateur");
const token_1 = require("../config/token");
const mongoose_1 = require("mongoose");
const ErrorResponse_1 = require("../bean/ErrorResponse");
exports.verificateurService = {
    getAllVerificateurs: async () => {
        try {
            const verificateurs = await Verificateur_1.Verificateur.find();
            return { success: true, data: verificateurs };
        }
        catch (error) {
            throw new ErrorResponse_1.ServiceError(error instanceof Error ? error.message : 'Unknown error', 500);
        }
    },
    getVerificateurById: async (id) => {
        try {
            if (!mongoose_1.Types.ObjectId.isValid(id)) {
                throw new ErrorResponse_1.ServiceError('Invalid verificateur ID format', 400);
            }
            const verificateur = await Verificateur_1.Verificateur.findById(id);
            if (!verificateur) {
                throw new ErrorResponse_1.ServiceError('Verificateur not found', 404);
            }
            return { success: true, data: verificateur };
        }
        catch (error) {
            throw new ErrorResponse_1.ServiceError(error instanceof Error ? error.message : 'Unknown error', 500);
        }
    },
    createVerificateur: async (verificateurData) => {
        try {
            const existingVerificateur = await Verificateur_1.Verificateur.findOne({ email: verificateurData.email });
            if (existingVerificateur) {
                throw new ErrorResponse_1.ServiceError('Verificateur with this email already exists', 409);
            }
            const verificateur = new Verificateur_1.Verificateur(verificateurData);
            await verificateur.save();
            const jwtToken = (0, token_1.createToken)(verificateur);
            return {
                success: true,
                data: {
                    user: verificateur,
                    token: jwtToken
                }
            };
        }
        catch (error) {
            throw new ErrorResponse_1.ServiceError(error instanceof Error ? error.message : 'Unknown error', 500);
        }
    },
    updateVerificateur: async (id, verificateurData) => {
        try {
            if (!mongoose_1.Types.ObjectId.isValid(id)) {
                throw new ErrorResponse_1.ServiceError('Invalid verificateur ID format', 400);
            }
            const verificateur = await Verificateur_1.Verificateur.findByIdAndUpdate(id, verificateurData, { new: true });
            if (!verificateur) {
                throw new ErrorResponse_1.ServiceError('Verificateur not found', 404);
            }
            return { success: true, data: verificateur };
        }
        catch (error) {
            throw new ErrorResponse_1.ServiceError(error instanceof Error ? error.message : 'Unknown error', 500);
        }
    },
    deleteVerificateur: async (id) => {
        try {
            if (!mongoose_1.Types.ObjectId.isValid(id)) {
                throw new ErrorResponse_1.ServiceError('Invalid verificateur ID format', 400);
            }
            const verificateur = await Verificateur_1.Verificateur.findByIdAndDelete(id);
            if (!verificateur) {
                throw new ErrorResponse_1.ServiceError('Verificateur not found', 404);
            }
            return { success: true, data: verificateur };
        }
        catch (error) {
            throw new ErrorResponse_1.ServiceError(error instanceof Error ? error.message : 'Unknown error', 500);
        }
    },
    loginVerificateur: async (email, password) => {
        try {
            const verificateur = await Verificateur_1.Verificateur.findOne({ email, password });
            if (!verificateur) {
                throw new ErrorResponse_1.ServiceError('Verificateur not found', 404);
            }
            const jwtToken = (0, token_1.createToken)(verificateur);
            return {
                success: true,
                data: {
                    user: verificateur,
                    token: jwtToken
                }
            };
        }
        catch (error) {
            throw new ErrorResponse_1.ServiceError(error instanceof Error ? error.message : 'Unknown error', 500);
        }
    },
    changePassword: async (id, newPassword) => {
        try {
            if (!mongoose_1.Types.ObjectId.isValid(id)) {
                throw new ErrorResponse_1.ServiceError('Invalid verificateur ID format', 400);
            }
            const verificateur = await Verificateur_1.Verificateur.findByIdAndUpdate(id, { password: newPassword }, { new: true });
            if (!verificateur) {
                throw new ErrorResponse_1.ServiceError('Verificateur not found', 404);
            }
            return { success: true, data: verificateur };
        }
        catch (error) {
            throw new ErrorResponse_1.ServiceError(error instanceof Error ? error.message : 'Unknown error', 500);
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
exports.default = exports.verificateurService;
