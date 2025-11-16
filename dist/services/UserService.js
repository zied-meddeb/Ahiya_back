"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const User_1 = require("../entities/User");
const nodemailer_1 = __importDefault(require("nodemailer"));
const crypto_1 = __importDefault(require("crypto"));
const UserResponse_1 = require("../utils/UserResponse");
const token_1 = require("../middleware/token");
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = require("mongoose");
const ErrorResponse_1 = require("../utils/ErrorResponse");
const bcrypt_1 = __importDefault(require("bcrypt"));
dotenv_1.default.config();
exports.UserService = {
    getAllUsers: async () => {
        try {
            const users = await User_1.User.find();
            if (!users || users.length === 0) {
                throw new ErrorResponse_1.ServiceError("No users found", 404);
            }
            return { success: true, data: users };
        }
        catch (error) {
            if (error instanceof ErrorResponse_1.ServiceError)
                throw error;
            throw new ErrorResponse_1.ServiceError(`Failed to fetch users: ${error instanceof Error ? error.message : "Unknown error"}`, 500);
        }
    },
    getUserById: async (id) => {
        try {
            if (!mongoose_1.Types.ObjectId.isValid(id)) {
                throw new ErrorResponse_1.ServiceError("Invalid user ID format", 400);
            }
            const user = await User_1.User.findById(id);
            if (!user) {
                throw new ErrorResponse_1.ServiceError("User not found", 404);
            }
            return { success: true, data: user };
        }
        catch (error) {
            if (error instanceof ErrorResponse_1.ServiceError)
                throw error;
            throw new ErrorResponse_1.ServiceError(`Failed to fetch user: ${error instanceof Error ? error.message : "Unknown error"}`, 500);
        }
    },
    createUser: async (userData) => {
        try {
            if (!userData.email || !userData.password) {
                throw new ErrorResponse_1.ServiceError("Email and password are required", 400);
            }
            const existingUser = await User_1.User.findOne({ email: userData.email });
            if (existingUser) {
                throw new ErrorResponse_1.ServiceError("User with this email already exists", 409);
            }
            const saltRounds = 10;
            const hashedPassword = await bcrypt_1.default.hash(userData.password, saltRounds);
            const verificationCode = crypto_1.default.randomInt(100000, 999999).toString();
            await exports.UserService.sendVerificationEmail(userData.email, verificationCode);
            const user = new User_1.User({
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
            const user = await User_1.User.findOne({ email });
            if (!user) {
                throw new ErrorResponse_1.ServiceError("User not found", 404);
            }
            if (user.isVerified) {
                return { success: true, message: "Email is already verified" };
            }
            if (user.verificationCode !== code) {
                throw new ErrorResponse_1.ServiceError("Invalid verification code", 401);
            }
            user.isVerified = true;
            user.verificationCode = undefined;
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
    updateUser: async (id, userData) => {
        try {
            if (!mongoose_1.Types.ObjectId.isValid(id)) {
                throw new ErrorResponse_1.ServiceError("Invalid user ID format", 400);
            }
            if (userData.password) {
                throw new ErrorResponse_1.ServiceError("Use changePassword route to update password", 400);
            }
            const user = await User_1.User.findByIdAndUpdate(id, userData, { new: true });
            if (!user) {
                throw new ErrorResponse_1.ServiceError("User not found", 404);
            }
            return {
                success: true,
                message: "User updated successfully",
                data: user,
            };
        }
        catch (error) {
            if (error instanceof ErrorResponse_1.ServiceError)
                throw error;
            throw new ErrorResponse_1.ServiceError(`User update failed: ${error instanceof Error ? error.message : "Unknown error"}`, 500);
        }
    },
    deleteUser: async (id) => {
        try {
            if (!mongoose_1.Types.ObjectId.isValid(id)) {
                throw new ErrorResponse_1.ServiceError("Invalid user ID format", 400);
            }
            const user = await User_1.User.findByIdAndDelete(id);
            if (!user) {
                throw new ErrorResponse_1.ServiceError("User not found", 404);
            }
            return {
                success: true,
                message: "User deleted successfully",
                data: { userId: id },
            };
        }
        catch (error) {
            if (error instanceof ErrorResponse_1.ServiceError)
                throw error;
            throw new ErrorResponse_1.ServiceError(`User deletion failed: ${error instanceof Error ? error.message : "Unknown error"}`, 500);
        }
    },
    loginUser: async (email, password) => {
        try {
            if (!email || !password) {
                throw new ErrorResponse_1.ServiceError("Email and password are required", 400);
            }
            const user = await User_1.User.findOne({ email });
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
    changePassword: async (userId, currentPassword, newPassword) => {
        try {
            if (!mongoose_1.Types.ObjectId.isValid(userId)) {
                throw new ErrorResponse_1.ServiceError("Invalid user ID format", 400);
            }
            if (!currentPassword || !newPassword) {
                throw new ErrorResponse_1.ServiceError("Current and new password are required", 400);
            }
            const user = await User_1.User.findById(userId);
            if (!user) {
                throw new ErrorResponse_1.ServiceError("User not found", 404);
            }
            const isMatch = await bcrypt_1.default.compare(currentPassword, user.password);
            if (!isMatch) {
                throw new ErrorResponse_1.ServiceError("Current password is incorrect", 401);
            }
            const saltRounds = 10;
            const newHashedPassword = await bcrypt_1.default.hash(newPassword, saltRounds);
            user.password = newHashedPassword;
            await user.save();
            return {
                success: true,
                message: "Password changed successfully",
                data: { userId: user._id },
            };
        }
        catch (error) {
            if (error instanceof ErrorResponse_1.ServiceError)
                throw error;
            throw new ErrorResponse_1.ServiceError(`Password change failed: ${error instanceof Error ? error.message : "Unknown error"}`, 500);
        }
    },
    updateUserPreferences: async (userId, preferences) => {
        try {
            if (!mongoose_1.Types.ObjectId.isValid(userId)) {
                throw new ErrorResponse_1.ServiceError("Invalid user ID format", 400);
            }
            if (!preferences || !preferences.favoriteCategories) {
                throw new ErrorResponse_1.ServiceError("Preferences data is required", 400);
            }
            const favoriteCategories = preferences.favoriteCategories.map((id) => {
                if (!mongoose_1.Types.ObjectId.isValid(id)) {
                    throw new ErrorResponse_1.ServiceError("Invalid category ID format", 400);
                }
                return new mongoose_1.Types.ObjectId(id);
            });
            const user = await User_1.User.findByIdAndUpdate(userId, { $set: { favoriteCategories } }, { new: true });
            if (!user) {
                throw new ErrorResponse_1.ServiceError("User not found", 404);
            }
            return {
                success: true,
                message: "Preferences updated successfully",
                data: user,
            };
        }
        catch (error) {
            if (error instanceof ErrorResponse_1.ServiceError)
                throw error;
            throw new ErrorResponse_1.ServiceError(`Preferences update failed: ${error instanceof Error ? error.message : "Unknown error"}`, 500);
        }
    },
    getUserPreferences: async (userId) => {
        try {
            if (!mongoose_1.Types.ObjectId.isValid(userId)) {
                throw new ErrorResponse_1.ServiceError("Invalid user ID format", 400);
            }
            const user = await User_1.User.findById(userId).populate("favoriteCategories", "nom");
            if (!user) {
                throw new ErrorResponse_1.ServiceError("User not found", 404);
            }
            return {
                success: true,
                data: user.favoriteCategories.map((cat) => cat._id),
            };
        }
        catch (error) {
            if (error instanceof ErrorResponse_1.ServiceError)
                throw error;
            throw new ErrorResponse_1.ServiceError(`Failed to get preferences: ${error instanceof Error ? error.message : "Unknown error"}`, 500);
        }
    },
    addToSearchHistory: async (userId, query) => {
        try {
            if (!mongoose_1.Types.ObjectId.isValid(userId)) {
                throw new ErrorResponse_1.ServiceError("Invalid user ID format", 400);
            }
            if (!query || typeof query !== "string") {
                throw new ErrorResponse_1.ServiceError("Valid search query is required", 400);
            }
            const user = await User_1.User.findByIdAndUpdate(userId, { $push: { searchHistory: { query } } }, { new: true });
            if (!user) {
                throw new ErrorResponse_1.ServiceError("User not found", 404);
            }
            return {
                success: true,
                message: "Search history updated",
                data: user,
            };
        }
        catch (error) {
            if (error instanceof ErrorResponse_1.ServiceError)
                throw error;
            throw new ErrorResponse_1.ServiceError(`Failed to update search history: ${error instanceof Error ? error.message : "Unknown error"}`, 500);
        }
    },
    trackProductView: async (userId, productId) => {
        try {
            if (!mongoose_1.Types.ObjectId.isValid(userId) ||
                !mongoose_1.Types.ObjectId.isValid(productId)) {
                throw new ErrorResponse_1.ServiceError("Invalid user or product ID format", 400);
            }
            await User_1.User.findByIdAndUpdate(userId, {
                $pull: { lastViewedProducts: { product: productId } },
            });
            const user = await User_1.User.findByIdAndUpdate(userId, { $push: { lastViewedProducts: { product: productId } } }, { new: true });
            if (!user) {
                throw new ErrorResponse_1.ServiceError("User not found", 404);
            }
            return {
                success: true,
                message: "Product view tracked",
                data: user,
            };
        }
        catch (error) {
            if (error instanceof ErrorResponse_1.ServiceError)
                throw error;
            throw new ErrorResponse_1.ServiceError(`Failed to track product view: ${error instanceof Error ? error.message : "Unknown error"}`, 500);
        }
    },
    getRecentViews: async (userId, limit = 5) => {
        try {
            if (!mongoose_1.Types.ObjectId.isValid(userId)) {
                throw new ErrorResponse_1.ServiceError("Invalid user ID format", 400);
            }
            if (isNaN(limit) || limit < 1) {
                limit = 5;
            }
            const user = await User_1.User.findById(userId).populate({
                path: "lastViewedProducts.product",
                options: { limit: parseInt(limit.toString()) },
            });
            if (!user) {
                throw new ErrorResponse_1.ServiceError("User not found", 404);
            }
            return {
                success: true,
                data: user.lastViewedProducts.map((item) => item.product),
            };
        }
        catch (error) {
            if (error instanceof ErrorResponse_1.ServiceError)
                throw error;
            throw new ErrorResponse_1.ServiceError(`Failed to get recent views: ${error instanceof Error ? error.message : "Unknown error"}`, 500);
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
            const transporter = nodemailer_1.default.createTransport({
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
            await User_1.User.findOneAndUpdate({ email: email }, { verificationCode: verificationCode }, { new: true });
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
    deleteUnverifiedUser: async (email) => {
        try {
            await User_1.User.findOneAndDelete({ email: email });
            return {
                success: true,
                message: `Unverified user deleted successfully`,
            };
        }
        catch (error) {
            throw new ErrorResponse_1.ServiceError(`Failed to delete unverified users: ${error instanceof Error ? error.message : "Unknown error"}`, 500);
        }
    },
};
exports.default = exports.UserService;
//# sourceMappingURL=UserService.js.map