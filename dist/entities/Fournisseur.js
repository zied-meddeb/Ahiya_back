"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Fournisseur = void 0;
const mongoose_1 = require("mongoose");
const fournisseurSchema = new mongoose_1.Schema({
    nom: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            'Entrer un email valide'
        ]
    },
    password: {
        type: String,
        required: true,
        minlength: [8, 'Mot de passe doit contenir au moins 8 caractères'],
    },
    telephone: {
        type: String,
        required: true,
        validate: {
            validator: function (v) {
                return /^\d{8}$/.test(v) || /^\+[1-9]\d{1,14}$/.test(v);
            },
            message: 'Numéro de téléphone doit être 8 chiffres'
        }
    },
    addresses: [{
            type: {
                type: String,
                enum: ['primary', 'secondary', 'warehouse', 'office'],
                required: true
            },
            street: {
                type: String,
                required: true
            },
            city: {
                type: String,
                required: true
            },
            state: {
                type: String,
                required: true
            },
            postalCode: {
                type: String,
                required: true
            },
            country: {
                type: String,
                required: true
            },
            isDefault: {
                type: Boolean,
                default: false
            },
            coordinates: {
                latitude: Number,
                longitude: Number
            }
        }],
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationCode: String,
    isOnboardingCompleted: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        default: 'fournisseur',
        enum: ['fournisseur']
    },
    storeInfo: {
        website: String,
        logoUrl: String,
        description: String,
        socialMedia: {
            facebook: String,
            instagram: String,
            twitter: String
        }
    },
    performanceMetrics: {
        totalProductsListed: {
            type: Number,
            default: 0
        },
        clickThroughRate: {
            type: Number,
            default: 0
        }
    }
}, { timestamps: true });
exports.Fournisseur = (0, mongoose_1.model)('Fournisseur', fournisseurSchema);
//# sourceMappingURL=Fournisseur.js.map