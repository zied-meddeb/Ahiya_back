const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const PromotionSchema = new Schema({
    type: {
        type: String,
        required: true
    },
}, { timestamps: true });

module.exports = Promotion = mongoose.model('promotion', PromotionSchema);