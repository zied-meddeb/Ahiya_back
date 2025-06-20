const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const favorisSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    produitId: {
        type: Schema.Types.ObjectId,
        ref: 'produit',
        required: true
    }
}, { timestamps: true });

module.exports = Favoris = mongoose.model('favoris', favorisSchema);