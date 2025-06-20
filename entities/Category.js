const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const categorySchema = new Schema({
     nom: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String
    },
    imageUrl: {
        type: String
    },
    parentCategory: {
        type: Schema.Types.ObjectId,
        ref: 'category'
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    displayOrder: {
        type: Number,
        default: 0
    }
    
}, { timestamps: true });

module.exports = Category = mongoose.model('category', categorySchema);