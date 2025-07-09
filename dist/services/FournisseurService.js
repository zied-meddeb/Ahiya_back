"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fournisseurService = void 0;
const Fournisseur_1 = require("../entities/Fournisseur");
const nodemailer = __importStar(require("nodemailer"));
const crypto_1 = __importDefault(require("crypto"));
const ErrorResponse_1 = require("../bean/ErrorResponse");
exports.fournisseurService = {
    getAllFournisseurs: async () => {
        try {
            const fournisseurs = await Fournisseur_1.Fournisseur.find();
            return { success: true, data: fournisseurs };
        }
        catch (error) {
            throw new ErrorResponse_1.ServiceError(error.message, 500);
        }
    },
    getFournisseurById: async (id) => {
        try {
            const fournisseur = await Fournisseur_1.Fournisseur.findById(id);
            if (!fournisseur) {
                throw new ErrorResponse_1.ServiceError('Fournisseur not found', 404);
            }
            return { success: true, data: fournisseur };
        }
        catch (error) {
            if (error instanceof ErrorResponse_1.ServiceError)
                throw error;
            throw new ErrorResponse_1.ServiceError(error.message, 500);
        }
    },
    createFournisseur: async (fournisseurData) => {
        try {
            const existingFournisseur = await Fournisseur_1.Fournisseur.findOne({ email: fournisseurData.email });
            if (existingFournisseur) {
                throw new ErrorResponse_1.ServiceError('Fournisseur with this email already exists', 409);
            }
            const verificationCode = crypto_1.default.randomInt(100000, 999999).toString();
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
            const fournisseur = new Fournisseur_1.Fournisseur({
                ...fournisseurData,
                isVerified: false,
                verificationCode
            });
            await fournisseur.save();
            return { success: true, message: 'Verification email sent. Please check your inbox.' };
        }
        catch (error) {
            throw new ErrorResponse_1.ServiceError(error.message, 500);
        }
    },
    verifyEmail: async (email, code) => {
        try {
            const fournisseur = await Fournisseur_1.Fournisseur.findOne({ email });
            if (!fournisseur)
                throw new ErrorResponse_1.ServiceError('Fournisseur not found', 404);
            if (fournisseur.verificationCode !== code)
                throw new ErrorResponse_1.ServiceError('Invalid verification code', 401);
            fournisseur.isVerified = true;
            fournisseur.verificationCode = undefined;
            await fournisseur.save();
            return { success: true, message: 'Email verified successfully.' };
        }
        catch (error) {
            throw new ErrorResponse_1.ServiceError(error.message, 500);
        }
    },
    updateFournisseur: async (id, fournisseurData) => {
        try {
            const fournisseur = await Fournisseur_1.Fournisseur.findByIdAndUpdate(id, fournisseurData, { new: true });
            if (!fournisseur) {
                throw new ErrorResponse_1.ServiceError('Fournisseur not found', 404);
            }
            return { success: true, data: fournisseur };
        }
        catch (error) {
            throw new ErrorResponse_1.ServiceError(error.message, 500);
        }
    },
    deleteFournisseur: async (id) => {
        try {
            const fournisseur = await Fournisseur_1.Fournisseur.findByIdAndDelete(id);
            if (!fournisseur) {
                throw new ErrorResponse_1.ServiceError('Fournisseur not found', 404);
            }
            return { success: true, data: fournisseur };
        }
        catch (error) {
            throw new ErrorResponse_1.ServiceError(error.message, 500);
        }
    },
    loginFournisseur: async (email, password) => {
        try {
            const fournisseur = await Fournisseur_1.Fournisseur.findOne({ email, password });
            if (!fournisseur) {
                throw new ErrorResponse_1.ServiceError('Invalid credentials', 401);
            }
            return { success: true, data: fournisseur };
        }
        catch (error) {
            throw new ErrorResponse_1.ServiceError(error.message, 500);
        }
    },
    changePassword: async (id, newPassword) => {
        try {
            const fournisseur = await Fournisseur_1.Fournisseur.findByIdAndUpdate(id, { password: newPassword }, { new: true });
            if (!fournisseur) {
                throw new ErrorResponse_1.ServiceError('Fournisseur not found', 404);
            }
            return { success: true, data: fournisseur };
        }
        catch (error) {
            throw new ErrorResponse_1.ServiceError(error.message, 500);
        }
    },
};
