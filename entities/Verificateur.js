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
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    telephone: {
        type: String,
        required: true
    },
    
});

module.exports = Verificateur = mongoose.model('verificateur', verificateurSchema);