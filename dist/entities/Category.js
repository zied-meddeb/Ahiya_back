"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Category = void 0;
const mongoose_1 = require("mongoose");
const categorySchema = new mongoose_1.Schema({
    nom: {
        type: String,
        required: true,
        unique: true,
    },
    description: String,
    imageUrl: String,
    parentCategories: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Category',
            default: [],
        },
    ],
    hierarchies: {
        type: [String],
        index: true,
        default: [],
    },
}, { timestamps: true });
// Virtual for children (inverse relationship)
categorySchema.virtual('children', {
    ref: 'Category',
    localField: '_id',
    foreignField: 'parentCategories',
});
categorySchema.set('toJSON', { virtuals: true });
categorySchema.set('toObject', { virtuals: true });
/**
 * Pre-save hook to compute all hierarchy paths
 * Example: ['clothes/homme/shoes', 'clothes/femme/shoes']
 */
categorySchema.pre('save', async function (next) {
    const category = this;
    // base case: no parent
    if (!category.parentCategories || category.parentCategories.length === 0) {
        category.hierarchies = [category.nom.toLowerCase()];
        return next();
    }
    const hierarchies = [];
    for (const parentId of category.parentCategories) {
        let path = category.nom.toLowerCase();
        let currentParentId = parentId;
        while (currentParentId) {
            const parent = await exports.Category.findById(currentParentId).select('nom parentCategories');
            if (!parent)
                break;
            path = `${parent.nom.toLowerCase()}/${path}`;
            // If parent has multiple parents, stop at one path (or recursively handle all branches if needed)
            currentParentId = parent.parentCategories?.[0]; // depth-first single path
        }
        hierarchies.push(path);
    }
    category.hierarchies = hierarchies;
    next();
});
exports.Category = (0, mongoose_1.model)('Category', categorySchema);
//# sourceMappingURL=Category.js.map