const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const verificateurSchema = new Schema({
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
        maxlength: [20, 'Mot de passe doit contenir au plus 20 caractères'],
        validate: {
            validator: function(v) {
               
                return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_\-])[A-Za-z\d@$!%*?&_\-]{8,}$/.test(v);

            },
            message: props => 'Mot de passe doit contenir au moins une lettre majuscule, une lettre minuscule, un chiffre et un caractère spécial'
        }
    },

    telephone: {
        type: String,
        required: true,
        validate: {
        validator: function(v) {
            // Either 8 digits (local) or international format
            return /^\d{8}$/.test(v) || /^\+[1-9]\d{1,14}$/.test(v);
        },
        message: props => `Numéro de téléphone doit être 8 chiffres`
    }
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationCode: { type: String }

}, { timestamps: true });

module.exports = Verificateur = mongoose.model('verificateur', verificateurSchema);