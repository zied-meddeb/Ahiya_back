"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Promotion = void 0;
const mongoose_1 = require("mongoose");
const PromotionSchema = new mongoose_1.Schema({
    type: {
        type: String,
        enum: ['Biens', 'Services'],
        required: true
    },
    description: {
        type: String,
        required: true
    },
    prix_original: {
        type: Number,
        required: true
    },
    prix_offre: {
        type: Number,
        required: true
    },
    date_debut: {
        type: Date,
        required: true
    },
    date_fin: {
        type: Date,
        required: true
    },
    produits: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Produit'
        }
    ]
}, { timestamps: true });
exports.Promotion = (0, mongoose_1.model)('Promotion', PromotionSchema);
