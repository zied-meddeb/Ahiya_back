const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const recommendationSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recommendedProducts: [{
        product: {
            type: Schema.Types.ObjectId,
            ref: 'produit'
        },
        score: {
            type: Number,
            default: 0
        },
        
    }],
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = Recommendation = mongoose.model('recommendation', recommendationSchema);