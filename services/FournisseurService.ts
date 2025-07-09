import { IFournisseur,Fournisseur } from '../entities/Fournisseur';
import * as nodemailer from 'nodemailer';
import crypto from 'crypto';
import { ServiceError } from '../bean/ErrorResponse';

interface FournisseurResponse {
    success: boolean;
    message?: string;
    data?: IFournisseur | IFournisseur[];
}

export const fournisseurService = {
    getAllFournisseurs: async (): Promise<FournisseurResponse> => {
        try {
            const fournisseurs = await Fournisseur.find();
            return {success:true, data: fournisseurs };
        } catch (error:any) {
            throw new ServiceError(error.message, 500);
        }
    },

    getFournisseurById: async (id: string): Promise<FournisseurResponse> => {
        try {
            const fournisseur = await Fournisseur.findById(id);
            if (!fournisseur) {
                throw new ServiceError('Fournisseur not found', 404);
            }
            return {success:true, data: fournisseur };
        } catch (error:any) {
            if (error instanceof ServiceError) throw error;
            throw new ServiceError(error.message, 500);
        }
    },

    createFournisseur: async (fournisseurData: Partial<IFournisseur>): Promise<FournisseurResponse> => {
        try {
            const existingFournisseur = await Fournisseur.findOne({ email: fournisseurData.email });
            if (existingFournisseur) {
                throw new ServiceError('Fournisseur with this email already exists', 409);
            }
            
            const verificationCode = crypto.randomInt(100000, 999999).toString();
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });

            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: fournisseurData.email,
                subject: 'Email Verification',
                text: `Your verification code is: ${verificationCode}`
            });

            const fournisseur = new Fournisseur({
                ...fournisseurData,
                isVerified: false,
                verificationCode
            });
            await fournisseur.save();
            return {success:true, message: 'Verification email sent. Please check your inbox.' };
        } catch (error:any) {
            throw new ServiceError(error.message, 500);
        }
    },

    verifyEmail: async (email: string, code: string): Promise<FournisseurResponse> => {
        try {
            const fournisseur = await Fournisseur.findOne({ email });
            if (!fournisseur) throw new ServiceError('Fournisseur not found', 404);
            if (fournisseur.verificationCode !== code) throw new ServiceError('Invalid verification code', 401);
            
            fournisseur.isVerified = true;
            fournisseur.verificationCode = undefined;
            await fournisseur.save();
            
            return {success:true, message: 'Email verified successfully.' };
        } catch (error:any) {
            throw new ServiceError(error.message, 500);
        }
    },

    updateFournisseur: async (id: string, fournisseurData: Partial<IFournisseur>): Promise<FournisseurResponse> => {
        try {
            const fournisseur = await Fournisseur.findByIdAndUpdate(id, fournisseurData, { new: true });
            if (!fournisseur) {
                throw new ServiceError('Fournisseur not found', 404);
            }
            return { success:true,data: fournisseur };
        } catch (error:any) {
            throw new ServiceError(error.message, 500);
        }
    },

    deleteFournisseur: async (id: string): Promise<FournisseurResponse> => {
        try {
            const fournisseur = await Fournisseur.findByIdAndDelete(id);
            if (!fournisseur) {
                throw new ServiceError('Fournisseur not found', 404);
            }
            return {success:true, data: fournisseur };
        } catch (error:any) {
            throw new ServiceError(error.message, 500);
        }
    },

    loginFournisseur: async (email: string, password: string): Promise<FournisseurResponse> => {
        try {
            const fournisseur = await Fournisseur.findOne({ email, password });
            if (!fournisseur) {
                throw new ServiceError('Invalid credentials', 401);
            }
            return {success:true, data: fournisseur };
        } catch (error:any) {
            throw new ServiceError(error.message, 500);
        }
    },

    changePassword: async (id: string, newPassword: string): Promise<FournisseurResponse> => {
        try {
            const fournisseur = await Fournisseur.findByIdAndUpdate(id, { password: newPassword }, { new: true });
            if (!fournisseur) {
                throw new ServiceError('Fournisseur not found', 404);
            }
            return {success:true, data: fournisseur };
        } catch (error:any) {
            throw new ServiceError(error.message, 500);
        }
    },

   

    
};