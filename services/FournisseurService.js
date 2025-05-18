const Fournisseur = require('../entities/Fournisseur');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
require('dotenv').config();

const fournisseurService = {
    getAllFournisseurs: async () => {
        try {
            const fournisseurs = await Fournisseur.find();
            return fournisseurs;
        } catch (error) {
            throw new Error( error.message);
        }
    },

    getFournisseurById: async (id) => {
        try {
            const fournisseur = await Fournisseur.findById(id);
            if (!fournisseur) {
                throw new Error('Fournisseur not found');
            }
            return fournisseur;
        } catch (error) {
            throw new Error( error.message);
        }
    },
    createFournisseur: async (fournisseurData) => {
    try {
        const existingFournisseur = await Fournisseur.findOne({ email: fournisseurData.email });
        if (existingFournisseur) {
            throw new Error('Fournisseur with this email already exists');
        }
        
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
        return { message: 'Verification email sent. Please check your inbox.' };
    } catch (error) {
        throw new Error(error.message);
    }
},
verifyEmail: async (email, code) => {
    try {
        const fournisseur = await Fournisseur.findOne({ email });
        if (!fournisseur) throw new Error('Fournisseur not found');
        if (fournisseur.verificationCode !== code) throw new Error('Invalid verification code');
        fournisseur.isVerified = true;
        fournisseur.verificationCode = undefined;
        await fournisseur.save();
        return { message: 'Email verified successfully.' };
    } catch (error) {
        throw new Error(error.message);
    }
},
    updateFournisseur: async (id, fournisseurData) => {
        try {
            const fournisseur = await Fournisseur.findByIdAndUpdate(id, fournisseurData, { new: true });
            if (!fournisseur) {
                throw new Error('Fournisseur not found');
            }
            return fournisseur;
        } catch (error) {
            throw new Error( error.message);
        }
    }
    ,
    deleteFournisseur: async (id) => {
        try {
            const fournisseur = await Fournisseur.findByIdAndDelete(id);
            if (!fournisseur) {
                throw new Error('Fournisseur not found');
            }
            return fournisseur;
        } catch (error) {
            throw new Error(error.message);
        }
    },

    loginFournisseur: async (email, password) => {
        try {
            const fournisseur = await Fournisseur.findOne({
                email: email,
                password: password
            });
            if (!fournisseur) {
                throw new Error('Invalid credentials');
            }
            return fournisseur;
        } catch (error) {
            throw new Error( error.message);
        }
    },
    changePassword: async (id, newPassword) => {
            try {
                const fournisseur = await Fournisseur.findByIdAndUpdate(id, { password: newPassword }, { new: true });
                if (!fournisseur) {
                    throw new Error('fournisseur not found');
                }
                return fournisseur;
            } catch (error) {
                throw new Error( error.message);
            }
        },
    
}
module.exports = fournisseurService;