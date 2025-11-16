"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
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
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationCode: String,
    favoriteCategories: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Category'
        }],
    lastViewedProducts: [{
            product: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'Produit'
            },
            viewedAt: {
                type: Date,
                default: Date.now
            }
        }],
    searchHistory: [{
            query: String,
            searchedAt: {
                type: Date,
                default: Date.now
            }
        }],
    role: {
        type: String,
        default: 'user',
        enum: ['user']
    }
}, { timestamps: true });
userSchema.index({ "createdAt": 1 }, { expireAfterSeconds: 3600, partialFilterExpression: { isVerified: false } });
exports.User = (0, mongoose_1.model)('User', userSchema);
//# sourceMappingURL=User.js.map