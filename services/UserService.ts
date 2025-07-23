import { IUser, User } from "../entities/User";
import nodemailer from "nodemailer";
import crypto from "crypto";

import { UserResponse } from "../utils/UserResponse";
import { createToken } from "../middleware/token";
import dotenv from "dotenv";
import { Types } from "mongoose";
import { ServiceError } from "../utils/ErrorResponse";
import bcrypt from "bcrypt";

dotenv.config();

interface UserResponseData {
  success: boolean;
  statusCode?: number;
  message?: string;
  data?: any;
  count?: number;
}

interface UserPreferences {
  favoriteCategories: string[];
}

interface SearchHistoryItem {
  query: string;
  searchedAt: Date;
}

interface ProductView {
  product: Types.ObjectId;
  viewedAt: Date;
}

export const UserService = {
  getAllUsers: async (): Promise<UserResponseData> => {
    try {
      const users = await User.find();
      if (!users || users.length === 0) {
        throw new ServiceError("No users found", 404);
      }
      return { success: true, data: users };
    } catch (error: any) {
      if (error instanceof ServiceError) throw error;
      throw new ServiceError(
        `Failed to fetch users: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        500
      );
    }
  },

  getUserById: async (id: string): Promise<UserResponseData> => {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new ServiceError("Invalid user ID format", 400);
      }

      const user = await User.findById(id);
      if (!user) {
        throw new ServiceError("User not found", 404);
      }
      return { success: true, data: user };
    } catch (error: any) {
      if (error instanceof ServiceError) throw error;
      throw new ServiceError(
        `Failed to fetch user: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        500
      );
    }
  },

  createUser: async (userData: Partial<IUser>): Promise<UserResponseData> => {
    try {
      if (!userData.email || !userData.password) {
        throw new ServiceError("Email and password are required", 400);
      }

      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        throw new ServiceError("User with this email already exists", 409);
      }

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
      const verificationCode = crypto.randomInt(100000, 999999).toString();

      await UserService.sendVerificationEmail(userData.email, verificationCode);

      const user = new User({
        ...userData,
        password: hashedPassword,
        isVerified: false,
        verificationCode,
      });

      await user.save();
      return {
        success: true,
        statusCode: 201,
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
  ): Promise<UserResponseData> => {
    try {
      if (!email || !code) {
        throw new ServiceError("Email and verification code are required", 400);
      }

      const user = await User.findOne({ email });
      if (!user) {
        throw new ServiceError("User not found", 404);
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

  updateUser: async (
    id: string,
    userData: Partial<IUser>
  ): Promise<UserResponseData> => {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new ServiceError("Invalid user ID format", 400);
      }

      if (userData.password) {
        throw new ServiceError(
          "Use changePassword route to update password",
          400
        );
      }

      const user = await User.findByIdAndUpdate(id, userData, { new: true });
      if (!user) {
        throw new ServiceError("User not found", 404);
      }

      return {
        success: true,
        message: "User updated successfully",
        data: user,
      };
    } catch (error: any) {
      if (error instanceof ServiceError) throw error;
      throw new ServiceError(
        `User update failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        500
      );
    }
  },

  deleteUser: async (id: string): Promise<UserResponseData> => {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new ServiceError("Invalid user ID format", 400);
      }

      const user = await User.findByIdAndDelete(id);
      if (!user) {
        throw new ServiceError("User not found", 404);
      }

      return {
        success: true,
        message: "User deleted successfully",
        data: { userId: id },
      };
    } catch (error: any) {
      if (error instanceof ServiceError) throw error;
      throw new ServiceError(
        `User deletion failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        500
      );
    }
  },

  loginUser: async (
    email: string,
    password: string
  ): Promise<UserResponseData> => {
    try {
      if (!email || !password) {
        throw new ServiceError("Email and password are required", 400);
      }

      const user = await User.findOne({ email });
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
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<UserResponseData> => {
    try {
      if (!Types.ObjectId.isValid(userId)) {
        throw new ServiceError("Invalid user ID format", 400);
      }

      if (!currentPassword || !newPassword) {
        throw new ServiceError("Current and new password are required", 400);
      }

      const user = await User.findById(userId);
      if (!user) {
        throw new ServiceError("User not found", 404);
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        throw new ServiceError("Current password is incorrect", 401);
      }

      const saltRounds = 10;
      const newHashedPassword = await bcrypt.hash(newPassword, saltRounds);
      user.password = newHashedPassword;
      await user.save();

      return {
        success: true,
        message: "Password changed successfully",
        data: { userId: user._id },
      };
    } catch (error: any) {
      if (error instanceof ServiceError) throw error;
      throw new ServiceError(
        `Password change failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        500
      );
    }
  },

  updateUserPreferences: async (
    userId: string,
    preferences: UserPreferences
  ): Promise<UserResponseData> => {
    try {
      if (!Types.ObjectId.isValid(userId)) {
        throw new ServiceError("Invalid user ID format", 400);
      }

      if (!preferences || !preferences.favoriteCategories) {
        throw new ServiceError("Preferences data is required", 400);
      }

      const favoriteCategories = preferences.favoriteCategories.map((id) => {
        if (!Types.ObjectId.isValid(id)) {
          throw new ServiceError("Invalid category ID format", 400);
        }
        return new Types.ObjectId(id);
      });

      const user = await User.findByIdAndUpdate(
        userId,
        { $set: { favoriteCategories } },
        { new: true }
      );

      if (!user) {
        throw new ServiceError("User not found", 404);
      }

      return {
        success: true,
        message: "Preferences updated successfully",
        data: user,
      };
    } catch (error: any) {
      if (error instanceof ServiceError) throw error;
      throw new ServiceError(
        `Preferences update failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        500
      );
    }
  },

  getUserPreferences: async (userId: string): Promise<UserResponseData> => {
    try {
      if (!Types.ObjectId.isValid(userId)) {
        throw new ServiceError("Invalid user ID format", 400);
      }

      const user = await User.findById(userId).populate(
        "favoriteCategories",
        "nom"
      );

      if (!user) {
        throw new ServiceError("User not found", 404);
      }

      return {
        success: true,
        data: user.favoriteCategories.map((cat: any) => cat._id),
      };
    } catch (error: any) {
      if (error instanceof ServiceError) throw error;
      throw new ServiceError(
        `Failed to get preferences: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        500
      );
    }
  },

  addToSearchHistory: async (
    userId: string,
    query: string
  ): Promise<UserResponseData> => {
    try {
      if (!Types.ObjectId.isValid(userId)) {
        throw new ServiceError("Invalid user ID format", 400);
      }

      if (!query || typeof query !== "string") {
        throw new ServiceError("Valid search query is required", 400);
      }

      const user = await User.findByIdAndUpdate(
        userId,
        { $push: { searchHistory: { query } } },
        { new: true }
      );

      if (!user) {
        throw new ServiceError("User not found", 404);
      }

      return {
        success: true,
        message: "Search history updated",
        data: user,
      };
    } catch (error: any) {
      if (error instanceof ServiceError) throw error;
      throw new ServiceError(
        `Failed to update search history: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        500
      );
    }
  },

  trackProductView: async (
    userId: string,
    productId: string
  ): Promise<UserResponseData> => {
    try {
      if (
        !Types.ObjectId.isValid(userId) ||
        !Types.ObjectId.isValid(productId)
      ) {
        throw new ServiceError("Invalid user or product ID format", 400);
      }

      await User.findByIdAndUpdate(userId, {
        $pull: { lastViewedProducts: { product: productId } },
      });

      const user = await User.findByIdAndUpdate(
        userId,
        { $push: { lastViewedProducts: { product: productId } } },
        { new: true }
      );

      if (!user) {
        throw new ServiceError("User not found", 404);
      }

      return {
        success: true,
        message: "Product view tracked",
        data: user,
      };
    } catch (error: any) {
      if (error instanceof ServiceError) throw error;
      throw new ServiceError(
        `Failed to track product view: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        500
      );
    }
  },

  getRecentViews: async (
    userId: string,
    limit: number = 5
  ): Promise<UserResponseData> => {
    try {
      if (!Types.ObjectId.isValid(userId)) {
        throw new ServiceError("Invalid user ID format", 400);
      }

      if (isNaN(limit) || limit < 1) {
        limit = 5;
      }

      const user = await User.findById(userId).populate({
        path: "lastViewedProducts.product",
        options: { limit: parseInt(limit.toString()) },
      });

      if (!user) {
        throw new ServiceError("User not found", 404);
      }

      return {
        success: true,
        data: user.lastViewedProducts.map((item) => item.product),
      };
    } catch (error: any) {
      if (error instanceof ServiceError) throw error;
      throw new ServiceError(
        `Failed to get recent views: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        500
      );
    }
  },

  sendVerificationEmail: async (
    email: string,
    verificationCode: string
  ): Promise<UserResponseData> => {
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

      await User.findOneAndUpdate(
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

  deleteUnverifiedUser: async (email: string): Promise<UserResponseData> => {
    try {
      await User.findOneAndDelete({ email: email });

      return {
        success: true,
        message: `Unverified user deleted successfully`,
      };
    } catch (error: any) {
      throw new ServiceError(
        `Failed to delete unverified users: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        500
      );
    }
  },
};

export default UserService;
