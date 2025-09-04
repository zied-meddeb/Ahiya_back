import { IFournisseur, Fournisseur, IAddress } from "../entities/Fournisseur";
import * as nodemailer from "nodemailer";
import crypto from "crypto";
import { ServiceError } from "../utils/ErrorResponse";
import { Types } from "mongoose";
import bcrypt from "bcrypt";
interface FournisseurResponse {
  success: boolean;
  message?: string;
  data?: any;
}
import { UserResponse } from "../utils/UserResponse";
import { createToken } from "../middleware/token";

export const fournisseurService = {
  getAllFournisseurs: async (): Promise<FournisseurResponse> => {
    try {
      const fournisseurs = await Fournisseur.find();
      return { success: true, data: fournisseurs };
    } catch (error: any) {
      throw new ServiceError(error.message, 500);
    }
  },

  getFournisseurById: async (id: string): Promise<FournisseurResponse> => {
    try {
      const fournisseur = await Fournisseur.findById(id);
      if (!fournisseur) {
        throw new ServiceError("Fournisseur not found", 404);
      }
      return { success: true, data: fournisseur };
    } catch (error: any) {
      if (error instanceof ServiceError) throw error;
      throw new ServiceError(error.message, 500);
    }
  },

  createFournisseur: async (
    userData: Partial<IFournisseur>
  ): Promise<FournisseurResponse> => {
    try {
      if (!userData.email || !userData.password || !userData.nom || !userData.telephone) {
        throw new ServiceError("Email, password, name, and telephone are required", 400);
      }

      const existingUser = await Fournisseur.findOne({ email: userData.email });
      if (existingUser) {
        throw new ServiceError("User with this email already exists", 409);
      }

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
      const verificationCode = crypto.randomInt(100000, 999999).toString();

      await fournisseurService.sendVerificationEmail(
        userData.email,
        verificationCode
      );

      const user = new Fournisseur({
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
    } catch (error: any) {
      if (error instanceof ServiceError) throw error;
      throw new ServiceError(
        `User creation failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        500
      );
    }
  },

  verifyEmail: async (
    email: string,
    code: string
  ): Promise<FournisseurResponse> => {
    try {
      if (!email || !code) {
        throw new ServiceError("Email and verification code are required", 400);
      }

      const user = await Fournisseur.findOne({ email });
      if (!user) {
        throw new ServiceError("Fournisseur not found", 404);
      }

      if (user.isVerified) {
        return { success: true, message: "Email is already verified" };
      }

      if (user.verificationCode !== code) {
        throw new ServiceError("Invalid verification code", 401);
      }

      user.isVerified = true;
      user.verificationCode = undefined;
      await user.save();
      const token = createToken(user);

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
    } catch (error: any) {
      if (error instanceof ServiceError) throw error;
      throw new ServiceError(
        `Email verification failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        500
      );
    }
  },

  sendVerificationEmail: async (
    email: string,
    verificationCode: string
  ): Promise<FournisseurResponse> => {
    try {
      if (!email || !verificationCode) {
        throw new ServiceError("Email and verification code are required", 400);
      }

      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        throw new ServiceError("Email service configuration missing", 500);
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

      await Fournisseur.findOneAndUpdate(
        { email: email },
        { verificationCode: verificationCode },
        { new: true }
      );

      return {
        success: true,
        message: "Verification email sent successfully",
      };
    } catch (error: any) {
      if (error instanceof ServiceError) throw error;
      throw new ServiceError(
        `Failed to send verification email: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        500
      );
    }
  },

  updateFournisseur: async (
    id: string,
    fournisseurData: Partial<IFournisseur>
  ): Promise<FournisseurResponse> => {
    try {
      const fournisseur = await Fournisseur.findByIdAndUpdate(
        id,
        fournisseurData,
        { new: true }
      );
      if (!fournisseur) {
        throw new ServiceError("Fournisseur not found", 404);
      }
      return { success: true, data: fournisseur };
    } catch (error: any) {
      throw new ServiceError(error.message, 500);
    }
  },

  deleteFournisseur: async (id: string): Promise<FournisseurResponse> => {
    try {
      const fournisseur = await Fournisseur.findByIdAndDelete(id);
      if (!fournisseur) {
        throw new ServiceError("Fournisseur not found", 404);
      }
      return { success: true, data: fournisseur };
    } catch (error: any) {
      throw new ServiceError(error.message, 500);
    }
  },

  loginFournisseur: async (
    email: string,
    password: string
  ): Promise<FournisseurResponse> => {
    try {
      if (!email || !password) {
        throw new ServiceError("Email and password are required", 400);
      }

      const user = await Fournisseur.findOne({ email });
      if (!user) {
        throw new ServiceError("Invalid credentials", 401);
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new ServiceError("Invalid credentials", 401);
      }

      if (!user.isVerified) {
        throw new ServiceError("Please verify your email first", 403);
      }

      const userResponse = new UserResponse(user);
      userResponse.token = createToken(user);

      return {
        success: true,
        message: "Login successful",
        data: userResponse,
      };
    } catch (error: any) {
      if (error instanceof ServiceError) throw error;
      throw new ServiceError(
        `Login failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        500
      );
    }
  },

  changePassword: async (
    id: string,
    newPassword: string
  ): Promise<FournisseurResponse> => {
    try {
      const fournisseur = await Fournisseur.findByIdAndUpdate(
        id,
        { password: newPassword },
        { new: true }
      );
      if (!fournisseur) {
        throw new ServiceError("Fournisseur not found", 404);
      }
      return { success: true, data: fournisseur };
    } catch (error: any) {
      throw new ServiceError(error.message, 500);
    }
  },

  // Address management methods
  addAddress: async (
    fournisseurId: string,
    addressData: IAddress
  ): Promise<FournisseurResponse> => {
    try {
      const fournisseur = await Fournisseur.findById(fournisseurId);
      if (!fournisseur) {
        throw new ServiceError("Fournisseur not found", 404);
      }

      // If this is the first address or marked as default, set it as default
      if (fournisseur.addresses.length === 0 || addressData.isDefault) {
        // Remove default flag from other addresses
        fournisseur.addresses.forEach(addr => addr.isDefault = false);
        addressData.isDefault = true;
      }

      fournisseur.addresses.push(addressData);
      await fournisseur.save();

      return { success: true, data: fournisseur };
    } catch (error: any) {
      if (error instanceof ServiceError) throw error;
      throw new ServiceError(error.message, 500);
    }
  },

  updateAddress: async (
    fournisseurId: string,
    addressId: string,
    addressData: Partial<IAddress>
  ): Promise<FournisseurResponse> => {
    try {
      const fournisseur = await Fournisseur.findById(fournisseurId);
      if (!fournisseur) {
        throw new ServiceError("Fournisseur not found", 404);
      }

      const addressIndex = fournisseur.addresses.findIndex(
        addr => addr._id?.toString() === addressId
      );
      
      if (addressIndex === -1) {
        throw new ServiceError("Address not found", 404);
      }

      // If setting as default, remove default from other addresses
      if (addressData.isDefault) {
        fournisseur.addresses.forEach(addr => addr.isDefault = false);
      }

      fournisseur.addresses[addressIndex] = {
        ...fournisseur.addresses[addressIndex],
        ...addressData
      };

      await fournisseur.save();
      return { success: true, data: fournisseur };
    } catch (error: any) {
      if (error instanceof ServiceError) throw error;
      throw new ServiceError(error.message, 500);
    }
  },

  deleteAddress: async (
    fournisseurId: string,
    addressId: string
  ): Promise<FournisseurResponse> => {
    try {
      const fournisseur = await Fournisseur.findById(fournisseurId);
      if (!fournisseur) {
        throw new ServiceError("Fournisseur not found", 404);
      }

      const addressIndex = fournisseur.addresses.findIndex(
        addr => addr._id?.toString() === addressId
      );
      
      if (addressIndex === -1) {
        throw new ServiceError("Address not found", 404);
      }

      const wasDefault = fournisseur.addresses[addressIndex].isDefault;
      fournisseur.addresses.splice(addressIndex, 1);

      // If we deleted the default address, set the first remaining as default
      if (wasDefault && fournisseur.addresses.length > 0) {
        fournisseur.addresses[0].isDefault = true;
      }

      await fournisseur.save();
      return { success: true, data: fournisseur };
    } catch (error: any) {
      if (error instanceof ServiceError) throw error;
      throw new ServiceError(error.message, 500);
    }
  },

  // Onboarding methods
  completeOnboarding: async (
    fournisseurId: string,
    onboardingData: {
      storeInfo?: any;
      addresses?: IAddress[];
      additionalInfo?: any;
    }
  ): Promise<FournisseurResponse> => {
    try {
      const fournisseur = await Fournisseur.findById(fournisseurId);
      if (!fournisseur) {
        throw new ServiceError("Fournisseur not found", 404);
      }

      // Update store info if provided
      if (onboardingData.storeInfo) {
        fournisseur.storeInfo = {
          ...fournisseur.storeInfo,
          ...onboardingData.storeInfo
        };
      }

      // Add addresses if provided
      if (onboardingData.addresses && onboardingData.addresses.length > 0) {
        // Set first address as default if no default exists
        if (onboardingData.addresses.length > 0 && !onboardingData.addresses.some(addr => addr.isDefault)) {
          onboardingData.addresses[0].isDefault = true;
        }
        fournisseur.addresses = onboardingData.addresses;
      }

      // Mark onboarding as completed
      fournisseur.isOnboardingCompleted = true;

      await fournisseur.save();
      return { success: true, data: fournisseur };
    } catch (error: any) {
      if (error instanceof ServiceError) throw error;
      throw new ServiceError(error.message, 500);
    }
  },

  getOnboardingStatus: async (
    fournisseurId: string
  ): Promise<FournisseurResponse> => {
    try {
      const fournisseur = await Fournisseur.findById(fournisseurId);
      if (!fournisseur) {
        throw new ServiceError("Fournisseur not found", 404);
      }

      return {
        success: true,
        data: {
          isOnboardingCompleted: fournisseur.isOnboardingCompleted,
          hasStoreInfo: !!fournisseur.storeInfo,
          hasAddresses: fournisseur.addresses.length > 0,
          addressesCount: fournisseur.addresses.length
        }
      };
    } catch (error: any) {
      if (error instanceof ServiceError) throw error;
      throw new ServiceError(error.message, 500);
    }
  },
};
