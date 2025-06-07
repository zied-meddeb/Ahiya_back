const User = require('../entities/User');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const saltRounds = 10; 
const UserResponse = require('../bean/UserResponse');
const createToken = require('../config/token');
require('dotenv').config();

const UserService = {
    getAllUsers: async () => {
        try {
            const Users = await User.find();
            return Users;
        } catch (error) {
            throw new Error(error.message);
        }
    },

    getUserById: async (id) => {
        try {
            const user = await User.findById(id);
            if (!user) {
                throw new Error('User not found');
            }
            return user;
        } catch (error) {
            throw new Error(error.message);
        }
    },

    createUser: async (UserData) => {
        try {
            const existingUser = await User.findOne({ email: UserData.email });
            if (existingUser) {
                throw new Error('User with this email already exists');
            }
            const hashedPassword = await bcrypt.hash(UserData.password, saltRounds);

            const verificationCode = crypto.randomInt(100000, 999999).toString();
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: "ziedmeddeb.it@gmail.com",
                    pass: "qcgd ftvn zpwj mych"
                }
            });

            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: UserData.email,
                subject: 'Email Verification',
                text: `Your verification code is: ${verificationCode}`
            });

            const user = new User({
                ...UserData,
                password: hashedPassword,
                isVerified: false,
                verificationCode
            });
            await user.save();
            return { message: 'Verification email sent. Please check your inbox.' };
        } catch (error) {
            throw new Error(error.message);
        }
    },

    verifyEmail: async (email, code) => {
        try {
            const user = await User.findOne({ email });
            if (!user) throw new Error('User not found');
            if (user.verificationCode !== code) throw new Error('Invalid verification code');
            user.isVerified = true;
            user.verificationCode = undefined;
            await user.save();
            return { message: 'Email verified successfully.' };
        } catch (error) {
            throw new Error(error.message);
        }
    },

    updateUser: async (id, UserData) => {
        try {
            // Prevent password updates through this route
            if (UserData.password) {
                throw new Error('Use changePassword route to update password');
            }
            
            const user = await User.findByIdAndUpdate(id, UserData, { new: true });
            if (!user) {
                throw new Error('User not found');
            }
            return user;
        } catch (error) {
            throw new Error(error.message);
        }
    },

    deleteUser: async (id) => {
        try {
            const user = await User.findByIdAndDelete(id); // Fixed: Changed 'user' to 'User'
            if (!user) {
                throw new Error('User not found');
            }
            return user;
        } catch (error) {
            throw new Error(error.message);
        }
    },

    loginUser: async (email, password) => {
        try {
            const user = await User.findOne({ email });
            if (!user) {
                throw new Error('Invalid credentials');
            }
            
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                throw new Error('Invalid credentials');
            }
            
            if (!user.isVerified) {
                throw new Error('Please verify your email first');
            }
            const userResponse = new UserResponse(user);
            userResponse.token = createToken(user._id, user.email);
            
            return userResponse;
        } catch (error) {
            throw new Error(error.message);
        }
    },

    changePassword: async (userId, currentPassword, newPassword) => {
        try {
            const user = await User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }
            
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                throw new Error('Current password is incorrect');
            }
            
            const newHashedPassword = await bcrypt.hash(newPassword, saltRounds);
            user.password = newHashedPassword;
            await user.save();
            
            return { message: 'Password changed successfully' };
        } catch (error) {
            throw new Error(error.message);
        }
    }
}

module.exports = UserService;