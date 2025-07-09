"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Category = void 0;
const mongoose_1 = require("mongoose");
const categorySchema = new mongoose_1.Schema({
    nom: {
        type: String,
        required: true,
        unique: true
    },
    description: String,
    imageUrl: String,
    displayOrder: {
        type: Number,
        default: 0
    },
    parentCategory: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Category'
    }
}, { timestamps: true });
exports.Category = (0, mongoose_1.model)('Category', categorySchema);
