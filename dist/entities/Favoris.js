"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Favoris = void 0;
const mongoose_1 = require("mongoose");
const favorisSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    produitId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Produit',
        required: true
    }
}, { timestamps: true });
exports.Favoris = (0, mongoose_1.model)('Favoris', favorisSchema);
//# sourceMappingURL=Favoris.js.map