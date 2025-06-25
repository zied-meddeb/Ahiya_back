const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const produitSchema = new Schema({
    nom: {
        type: String,
        required: true
    },
    description: {
        type: String, 
        required: true
    },
    prix: {
        type: Number,
        required: true
    },
    old_prix:{
        type: Number,
        required: true
    },
    promotion:{
        pourcentage: {
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
        }
    },
     imageUrl: {
        type: String, 
        
    }, 
    verified: {
        type: Boolean, 
        default: false
    },
    lien_produit: {
        type: String, 
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'category',
        required: true
    },
    fournisseur: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'fournisseur',
        required: true 
    },  
    checked_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'verificateur',
    },
    tags: [{
    type: String
    }],
    views: {
        type: Number,
        default: 0
    },
    clicks: {
        type: Number,
        default: 0
    }
   
}, { timestamps: true });

module.exports = Produit = mongoose.model('produit', produitSchema); 