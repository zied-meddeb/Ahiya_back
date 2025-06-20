const User = require('../entities/User');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const saltRounds = 10; 
const UserResponse = require('../bean/UserResponse');
const createToken = require('../config/token');
require('dotenv').config();
const { Types } = require('mongoose');
const ServiceError = require('../bean/ErrorResponse');



const UserService = {
    getAllUsers: async () => {
        try {
            const users = await User.find();
            if (!users || users.length === 0) {
                throw new ServiceError('No users found', 404);
            }
            return { success: true, data: users };
        } catch (error) {
            if (error instanceof ServiceError) throw error;
            throw new ServiceError(`Failed to fetch users: ${error.message}`, 500);
        }
    },

    getUserById: async (id) => {
        try {
            if (!Types.ObjectId.isValid(id)) {
                throw new ServiceError('Invalid user ID format', 400);
            }
            
            const user = await User.findById(id);
            if (!user) {
                throw new ServiceError('User not found', 404);
            }
            return { success: true, data: user };
        } catch (error) {
            if (error instanceof ServiceError) throw error;
            throw new ServiceError(`Failed to fetch user: ${error.message}`, 500);
        }
    },

    createUser: async (userData) => {
        try {
            if (!userData.email || !userData.password) {
                throw new ServiceError('Email and password are required', 400);
            }

            const existingUser = await User.findOne({ email: userData.email });
            if (existingUser) {
                throw new ServiceError('User with this email already exists', 409);
            }

            const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
            const verificationCode = crypto.randomInt(100000, 999999).toString();

            await UserService.sendVerificationEmail(userData.email, verificationCode);
            
            const user = new User({
                ...userData,
                password: hashedPassword,
                isVerified: false,
                verificationCode
            });

            await user.save();
            return { 
                success: true, 
                statusCode: 201,
                message: 'Verification email sent. Please check your inbox.',
                data: { userId: user._id }
            };
        } catch (error) {
            if (error instanceof ServiceError) throw error;
            throw new ServiceError(`User creation failed: ${error.message}`, 500);
        }
    },

    verifyEmail: async (email, code) => {
        try {
            if (!email || !code) {
                throw new ServiceError('Email and verification code are required', 400);
            }

            const user = await User.findOne({ email });
            if (!user) {
                throw new ServiceError('User not found', 404);
            }

            if (user.isVerified) {
                return { success: true, message: 'Email is already verified' };
            }

            if (user.verificationCode !== code) {
                throw new ServiceError('Invalid verification code', 401);
            }

            user.isVerified = true;
            user.verificationCode = undefined;
            await user.save();
            const token = createToken(user._id, user.email);

            return { 
                success: true, 
                message: 'Email verified successfully.',
                data: { id: user._id,email: user.email, nom: user.nom, token:token }
            };
        } catch (error) {
            if (error instanceof ServiceError) throw error;
            throw new ServiceError(`Email verification failed: ${error.message}`, 500);
        }
    },

    updateUser: async (id, userData) => {
        try {
            if (!Types.ObjectId.isValid(id)) {
                throw new ServiceError('Invalid user ID format', 400);
            }

            if (userData.password) {
                throw new ServiceError('Use changePassword route to update password', 400);
            }
            
            const user = await User.findByIdAndUpdate(id, userData, { new: true });
            if (!user) {
                throw new ServiceError('User not found', 404);
            }
            
            return { 
                success: true, 
                message: 'User updated successfully',
                data: user 
            };
        } catch (error) {
            if (error instanceof ServiceError) throw error;
            throw new ServiceError(`User update failed: ${error.message}`, 500);
        }
    },

    deleteUser: async (id) => {
        try {
            if (!Types.ObjectId.isValid(id)) {
                throw new ServiceError('Invalid user ID format', 400);
            }

            const user = await User.findByIdAndDelete(id);
            if (!user) {
                throw new ServiceError('User not found', 404);
            }
            
            return { 
                success: true, 
                message: 'User deleted successfully',
                data: { userId: id }
            };
        } catch (error) {
            if (error instanceof ServiceError) throw error;
            throw new ServiceError(`User deletion failed: ${error.message}`, 500);
        }
    },

    loginUser: async (email, password) => {
        try {
            if (!email || !password) {
                throw new ServiceError('Email and password are required', 400);
            }

            const user = await User.findOne({ email });
            if (!user) {
                throw new ServiceError('Invalid credentials', 401);
            }
            
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                throw new ServiceError('Invalid credentials', 401);
            }
            
            if (!user.isVerified) {
                throw new ServiceError('Please verify your email first', 403);
            }
            
            const userResponse = new UserResponse(user);
            userResponse.token = createToken(user._id, user.email);
            
            return { 
                success: true, 
                message: 'Login successful',
                data: userResponse 
            };
        } catch (error) {
            if (error instanceof ServiceError) throw error;
            throw new ServiceError(`Login failed: ${error.message}`, 500);
        }
    },

    changePassword: async (userId, currentPassword, newPassword) => {
        try {
            if (!Types.ObjectId.isValid(userId)) {
                throw new ServiceError('Invalid user ID format', 400);
            }

            if (!currentPassword || !newPassword) {
                throw new ServiceError('Current and new password are required', 400);
            }

            const user = await User.findById(userId);
            if (!user) {
                throw new ServiceError('User not found', 404);
            }
            
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                throw new ServiceError('Current password is incorrect', 401);
            }
            
            const newHashedPassword = await bcrypt.hash(newPassword, saltRounds);
            user.password = newHashedPassword;
            await user.save();
            
            return { 
                success: true, 
                message: 'Password changed successfully',
                data: { userId: user._id }
            };
        } catch (error) {
            if (error instanceof ServiceError) throw error;
            throw new ServiceError(`Password change failed: ${error.message}`, 500);
        }
    },

    updateUserPreferences: async (userId, preferences) => {
        try {
            if (!Types.ObjectId.isValid(userId)) {
                throw new ServiceError('Invalid user ID format', 400);
            }

            if (!preferences || !preferences.favoriteCategories) {
                throw new ServiceError('Preferences data is required', 400);
            }

            const favoriteCategories = preferences.favoriteCategories.map(id => {
                if (!Types.ObjectId.isValid(id)) {
                    throw new ServiceError('Invalid category ID format', 400);
                }
                return new Types.ObjectId(id);
            });
            
            const user = await User.findByIdAndUpdate(
                userId,
                { $set: { favoriteCategories } },
                { new: true }
            );

            if (!user) {
                throw new ServiceError('User not found', 404);
            }

            return { 
                success: true, 
                message: 'Preferences updated successfully',
                data: user 
            };
        } catch (error) {
            if (error instanceof ServiceError) throw error;
            throw new ServiceError(`Preferences update failed: ${error.message}`, 500);
        }
    },

    getUserPreferences: async (userId) => {
        try {
            if (!Types.ObjectId.isValid(userId)) {
                throw new ServiceError('Invalid user ID format', 400);
            }

            const user = await User.findById(userId)
                .populate('favoriteCategories', 'nom');    
                
            if (!user) {
                throw new ServiceError('User not found', 404);
            }

            return { 
                success: true, 
                data: user.favoriteCategories.map(cat => cat.nom) 
            };
        } catch (error) {
            if (error instanceof ServiceError) throw error;
            throw new ServiceError(`Failed to get preferences: ${error.message}`, 500);
        }
    },

    addToSearchHistory: async (userId, query) => {
        try {
            if (!Types.ObjectId.isValid(userId)) {
                throw new ServiceError('Invalid user ID format', 400);
            }

            if (!query || typeof query !== 'string') {
                throw new ServiceError('Valid search query is required', 400);
            }

            const user = await User.findByIdAndUpdate(
                userId,
                { $push: { searchHistory: { query } } },
                { new: true }
            );

            if (!user) {
                throw new ServiceError('User not found', 404);
            }

            return { 
                success: true, 
                message: 'Search history updated',
                data: user 
            };
        } catch (error) {
            if (error instanceof ServiceError) throw error;
            throw new ServiceError(`Failed to update search history: ${error.message}`, 500);
        }
    },

    trackProductView: async (userId, productId) => {
        try {
            if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(productId)) {
                throw new ServiceError('Invalid user or product ID format', 400);
            }

            await User.findByIdAndUpdate(
                userId,
                { $pull: { lastViewedProducts: { product: productId } } }
            );
            
            const user = await User.findByIdAndUpdate(
                userId,
                { $push: { lastViewedProducts: { product: productId } } },
                { new: true }
            );

            if (!user) {
                throw new ServiceError('User not found', 404);
            }

            return { 
                success: true, 
                message: 'Product view tracked',
                data: user 
            };
        } catch (error) {
            if (error instanceof ServiceError) throw error;
            throw new ServiceError(`Failed to track product view: ${error.message}`, 500);
        }
    },

    getRecentViews: async (userId, limit = 5) => {
        try {
            if (!Types.ObjectId.isValid(userId)) {
                throw new ServiceError('Invalid user ID format', 400);
            }

            if (isNaN(limit) || limit < 1) {
                limit = 5;
            }

            const user = await User.findById(userId)
                .populate({
                    path: 'lastViewedProducts.product',
                    options: { limit: parseInt(limit) }
                });
            
            if (!user) {
                throw new ServiceError('User not found', 404);
            }

            return { 
                success: true, 
                data: user.lastViewedProducts.map(item => item.product) 
            };
        } catch (error) {
            if (error instanceof ServiceError) throw error;
            throw new ServiceError(`Failed to get recent views: ${error.message}`, 500);
        }
    },

    sendVerificationEmail: async (email, verificationCode) => {
        try {
            if (!email || !verificationCode) {
                throw new ServiceError('Email and verification code are required', 400);
            }

            if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
                throw new ServiceError('Email service configuration missing', 500);
            }

            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });

            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Email Verification',
                text: `Your verification code is: ${verificationCode}`,
                html: `<p>Your verification code is: <strong>${verificationCode}</strong></p>`
            });

            await User.findOneAndUpdate(
                { email: email },
                { verificationCode: verificationCode },
                { new: true }
            );
            
            return { 
                success: true, 
                message: 'Verification email sent successfully' 
            };
        } catch (error) {
            if (error instanceof ServiceError) throw error;
            throw new ServiceError(`Failed to send verification email: ${error.message}`, 500);
        }
    },
    deleteUnverifiedUser: async (email) => {
        try {
            await User.findOneAndDelete({ email: email });
            
            return { 
                success: true, 
                message: `Unverified user deleted successfully` 
            };
        } catch (error) {
            throw new ServiceError(`Failed to delete unverified users: ${error.message}`, 500);
        }
    }
};

module.exports = UserService;