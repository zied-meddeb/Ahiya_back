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
const ErrorResponse_1 = require("../utils/ErrorResponse");
const bcrypt_1 = __importDefault(require("bcrypt"));
const UserResponse_1 = require("../utils/UserResponse");
const token_1 = require("../middleware/token");
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
                throw new ErrorResponse_1.ServiceError("Fournisseur not found", 404);
            }
            return { success: true, data: fournisseur };
        }
        catch (error) {
            if (error instanceof ErrorResponse_1.ServiceError)
                throw error;
            throw new ErrorResponse_1.ServiceError(error.message, 500);
        }
    },
    createFournisseur: async (userData) => {
        try {
            if (!userData.email ||
                !userData.password ||
                !userData.nom ||
                !userData.telephone) {
                throw new ErrorResponse_1.ServiceError("Email, password, name, and telephone are required", 400);
            }
            const existingUser = await Fournisseur_1.Fournisseur.findOne({ email: userData.email });
            if (existingUser) {
                throw new ErrorResponse_1.ServiceError("User with this email already exists", 409);
            }
            const saltRounds = 10;
            const hashedPassword = await bcrypt_1.default.hash(userData.password, saltRounds);
            const verificationCode = crypto_1.default.randomInt(100000, 999999).toString();
            await exports.fournisseurService.sendVerificationEmail(userData.email, verificationCode);
            const user = new Fournisseur_1.Fournisseur({
                ...userData,
                password: hashedPassword,
                isVerified: false,
                verificationCode,
                addresses: userData.addresses || [], // Initialize with empty array if not provided
            });
            await user.save();
            return {
                success: true,
                message: "Verification email sent. Please check your inbox.",
                data: { userId: user._id },
            };
        }
        catch (error) {
            if (error instanceof ErrorResponse_1.ServiceError)
                throw error;
            throw new ErrorResponse_1.ServiceError(`User creation failed: ${error instanceof Error ? error.message : "Unknown error"}`, 500);
        }
    },
    verifyEmail: async (email, code) => {
        try {
            if (!email || !code) {
                throw new ErrorResponse_1.ServiceError("Email and verification code are required", 400);
            }
            const user = await Fournisseur_1.Fournisseur.findOne({ email });
            if (!user) {
                throw new ErrorResponse_1.ServiceError("Fournisseur not found", 404);
            }
            if (user.isVerified) {
                return { success: true, message: "Email is already verified" };
            }
            if (user.verificationCode !== code) {
                throw new ErrorResponse_1.ServiceError("Invalid verification code", 401);
            }
            user.isVerified = true;
            user.verificationCode = undefined;
            user.isOnboardingCompleted = true;
            await user.save();
            const token = (0, token_1.createToken)(user);
            return {
                success: true,
                message: "Email verified successfully.",
                data: {
                    id: user._id,
                    email: user.email,
                    nom: user.nom,
                    token: token,
                },
            };
        }
        catch (error) {
            if (error instanceof ErrorResponse_1.ServiceError)
                throw error;
            throw new ErrorResponse_1.ServiceError(`Email verification failed: ${error instanceof Error ? error.message : "Unknown error"}`, 500);
        }
    },
    sendVerificationEmail: async (email, verificationCode) => {
        try {
            if (!email || !verificationCode) {
                throw new ErrorResponse_1.ServiceError("Email and verification code are required", 400);
            }
            if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
                throw new ErrorResponse_1.ServiceError("Email service configuration missing", 500);
            }
            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: "Email Verification",
                text: `Your verification code is: ${verificationCode}`,
                html: `<p>Your verification code is: <strong>${verificationCode}</strong></p>`,
            });
            await Fournisseur_1.Fournisseur.findOneAndUpdate({ email: email }, { verificationCode: verificationCode }, { new: true });
            return {
                success: true,
                message: "Verification email sent successfully",
            };
        }
        catch (error) {
            if (error instanceof ErrorResponse_1.ServiceError)
                throw error;
            throw new ErrorResponse_1.ServiceError(`Failed to send verification email: ${error instanceof Error ? error.message : "Unknown error"}`, 500);
        }
    },
    updateFournisseur: async (id, fournisseurData) => {
        try {
            const fournisseur = await Fournisseur_1.Fournisseur.findByIdAndUpdate(id, fournisseurData, { new: true });
            if (!fournisseur) {
                throw new ErrorResponse_1.ServiceError("Fournisseur not found", 404);
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
                throw new ErrorResponse_1.ServiceError("Fournisseur not found", 404);
            }
            return { success: true, data: fournisseur };
        }
        catch (error) {
            throw new ErrorResponse_1.ServiceError(error.message, 500);
        }
    },
    loginFournisseur: async (email, password) => {
        try {
            if (!email || !password) {
                throw new ErrorResponse_1.ServiceError("Email and password are required", 400);
            }
            const user = await Fournisseur_1.Fournisseur.findOne({ email });
            if (!user) {
                throw new ErrorResponse_1.ServiceError("Invalid credentials", 401);
            }
            const isMatch = await bcrypt_1.default.compare(password, user.password);
            if (!isMatch) {
                throw new ErrorResponse_1.ServiceError("Invalid credentials", 401);
            }
            if (!user.isVerified) {
                throw new ErrorResponse_1.ServiceError("Please verify your email first", 403);
            }
            const userResponse = new UserResponse_1.UserResponse(user);
            userResponse.token = (0, token_1.createToken)(user);
            return {
                success: true,
                message: "Login successful",
                data: userResponse,
            };
        }
        catch (error) {
            if (error instanceof ErrorResponse_1.ServiceError)
                throw error;
            throw new ErrorResponse_1.ServiceError(`Login failed: ${error instanceof Error ? error.message : "Unknown error"}`, 500);
        }
    },
    changePassword: async (id, newPassword) => {
        try {
            const fournisseur = await Fournisseur_1.Fournisseur.findByIdAndUpdate(id, { password: newPassword }, { new: true });
            if (!fournisseur) {
                throw new ErrorResponse_1.ServiceError("Fournisseur not found", 404);
            }
            return { success: true, data: fournisseur };
        }
        catch (error) {
            throw new ErrorResponse_1.ServiceError(error.message, 500);
        }
    },
    // Address management methods
    addAddress: async (fournisseurId, addressData) => {
        try {
            const fournisseur = await Fournisseur_1.Fournisseur.findById(fournisseurId);
            if (!fournisseur) {
                throw new ErrorResponse_1.ServiceError("Fournisseur not found", 404);
            }
            // If this is the first address or marked as default, set it as default
            if (fournisseur.addresses.length === 0 || addressData.isDefault) {
                // Remove default flag from other addresses
                fournisseur.addresses.forEach((addr) => (addr.isDefault = false));
                addressData.isDefault = true;
            }
            fournisseur.addresses.push(addressData);
            await fournisseur.save();
            return { success: true, data: fournisseur };
        }
        catch (error) {
            if (error instanceof ErrorResponse_1.ServiceError)
                throw error;
            throw new ErrorResponse_1.ServiceError(error.message, 500);
        }
    },
    updateAddress: async (fournisseurId, addressId, addressData) => {
        try {
            const fournisseur = await Fournisseur_1.Fournisseur.findById(fournisseurId);
            if (!fournisseur) {
                throw new ErrorResponse_1.ServiceError("Fournisseur not found", 404);
            }
            const addressIndex = fournisseur.addresses.findIndex((addr) => addr._id?.toString() === addressId);
            if (addressIndex === -1) {
                throw new ErrorResponse_1.ServiceError("Address not found", 404);
            }
            // If setting as default, remove default from other addresses
            if (addressData.isDefault) {
                fournisseur.addresses.forEach((addr) => (addr.isDefault = false));
            }
            fournisseur.addresses[addressIndex] = {
                ...fournisseur.addresses[addressIndex],
                ...addressData,
            };
            await fournisseur.save();
            return { success: true, data: fournisseur };
        }
        catch (error) {
            if (error instanceof ErrorResponse_1.ServiceError)
                throw error;
            throw new ErrorResponse_1.ServiceError(error.message, 500);
        }
    },
    deleteAddress: async (fournisseurId, addressId) => {
        try {
            const fournisseur = await Fournisseur_1.Fournisseur.findById(fournisseurId);
            if (!fournisseur) {
                throw new ErrorResponse_1.ServiceError("Fournisseur not found", 404);
            }
            const addressIndex = fournisseur.addresses.findIndex((addr) => addr._id?.toString() === addressId);
            if (addressIndex === -1) {
                throw new ErrorResponse_1.ServiceError("Address not found", 404);
            }
            const wasDefault = fournisseur.addresses[addressIndex].isDefault;
            fournisseur.addresses.splice(addressIndex, 1);
            // If we deleted the default address, set the first remaining as default
            if (wasDefault && fournisseur.addresses.length > 0) {
                fournisseur.addresses[0].isDefault = true;
            }
            await fournisseur.save();
            return { success: true, data: fournisseur };
        }
        catch (error) {
            if (error instanceof ErrorResponse_1.ServiceError)
                throw error;
            throw new ErrorResponse_1.ServiceError(error.message, 500);
        }
    },
    // Onboarding methods
    completeOnboarding: async (fournisseurId, onboardingData) => {
        try {
            const fournisseur = await Fournisseur_1.Fournisseur.findById(fournisseurId);
            if (!fournisseur) {
                throw new ErrorResponse_1.ServiceError("Fournisseur not found", 404);
            }
            // Update store info if provided
            if (onboardingData.storeInfo) {
                fournisseur.storeInfo = {
                    ...fournisseur.storeInfo,
                    ...onboardingData.storeInfo,
                };
            }
            // Add addresses if provided
            if (onboardingData.addresses && onboardingData.addresses.length > 0) {
                // Set first address as default if no default exists
                if (onboardingData.addresses.length > 0 &&
                    !onboardingData.addresses.some((addr) => addr.isDefault)) {
                    onboardingData.addresses[0].isDefault = true;
                }
                fournisseur.addresses = onboardingData.addresses;
            }
            // Mark onboarding as completed
            fournisseur.isOnboardingCompleted = true;
            await fournisseur.save();
            return { success: true, data: fournisseur };
        }
        catch (error) {
            if (error instanceof ErrorResponse_1.ServiceError)
                throw error;
            throw new ErrorResponse_1.ServiceError(error.message, 500);
        }
    },
    getOnboardingStatus: async (fournisseurId) => {
        try {
            const fournisseur = await Fournisseur_1.Fournisseur.findById(fournisseurId);
            if (!fournisseur) {
                throw new ErrorResponse_1.ServiceError("Fournisseur not found", 404);
            }
            return {
                success: true,
                data: {
                    isOnboardingCompleted: fournisseur.isOnboardingCompleted,
                    hasStoreInfo: !!fournisseur.storeInfo,
                    hasAddresses: fournisseur.addresses.length > 0,
                    addressesCount: fournisseur.addresses.length,
                },
            };
        }
        catch (error) {
            if (error instanceof ErrorResponse_1.ServiceError)
                throw error;
            throw new ErrorResponse_1.ServiceError(error.message, 500);
        }
    },
};
//# sourceMappingURL=FournisseurService.js.map