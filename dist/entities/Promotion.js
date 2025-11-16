"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Promotion = void 0;
const mongoose_1 = require("mongoose");
const PromotionSchema = new mongoose_1.Schema({
    Fournisseur: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Fournisseur",
        required: true,
    },
    type: {
        type: String,
        enum: ["Biens", "Services"],
        required: true,
    },
    afficheUrls: {
        type: [String],
        required: true,
        unique: true,
        set: (v) => Array.from(new Set(v)),
        validate: {
            validator: (v) => v.length > 0,
            message: "At least one affiche URL is required",
        },
    },
    titre: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    prix_original: {
        type: Number,
        required: true,
    },
    prix_offre: {
        type: Number,
        required: true,
    },
    date_debut: {
        type: Date,
        required: true,
    },
    date_fin: {
        type: Date,
        required: true,
    },
    date_affiche: {
        type: Date,
        required: true,
    },
    date_affiche_fin: {
        type: Date,
        required: true,
    },
    produits: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "Produit",
        },
    ],
    statut: {
        type: String,
        enum: ["ATT_VER", "REJETE", "VALIDE", "ACTIVE"],
        default: "ATT_VER",
    },
}, { timestamps: true });
exports.Promotion = (0, mongoose_1.model)("Promotion", PromotionSchema);
//# sourceMappingURL=Promotion.js.map