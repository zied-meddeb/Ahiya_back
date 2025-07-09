"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Recommendation = void 0;
const mongoose_1 = require("mongoose");
const recommendationSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recommendedProducts: [{
            product: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'Produit'
            },
            score: {
                type: Number,
                default: 0
            }
        }],
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });
exports.Recommendation = (0, mongoose_1.model)('Recommendation', recommendationSchema);
