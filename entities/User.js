const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const userSchema = new Schema({
    nom: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
         match: [
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            'Entrer un email valide'
        ]
    },
    password: {
        type: String,
        required: true,
        minlength: [8, 'Mot de passe doit contenir au moins 8 caractères'],
        
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationCode: { type: String },

    favoriteCategories: [{
        type: Schema.Types.ObjectId,
        ref: 'category'
    }],
    
    lastViewedProducts: [{
        product: {
            type: Schema.Types.ObjectId,
            ref: 'produit'
        },
        viewedAt: {
            type: Date,
            default: Date.now
        }
    }],
    searchHistory: [{
        query: String,
        searchedAt: {
            type: Date,
            default: Date.now
        }
        }]
    

}, { timestamps: true });

userSchema.index(
  { "createdAt": 1 },
  { expireAfterSeconds: 3600, partialFilterExpression: { isVerified: false } }
);

module.exports = User = mongoose.model('user', userSchema);