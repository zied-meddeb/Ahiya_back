"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Produit = void 0;
const mongoose_1 = require("mongoose");
const produitSchema = new mongoose_1.Schema({
    nom: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    imageUrl: String,
    verified: {
        type: Boolean,
        default: false
    },
    lien_produit: String,
    views: {
        type: Number,
        default: 0
    },
    tags: [String],
    category: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    fournisseur: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Fournisseur',
        required: true
    },
    prix: {
        type: Number,
        required: true
    },
    checked_by: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Verificateur'
    }
}, { timestamps: true });
exports.Produit = (0, mongoose_1.model)('Produit', produitSchema);
//# sourceMappingURL=Produit.js.map