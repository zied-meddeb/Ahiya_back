const Verificateur = require('../entities/Verificateur');
const token= require('../config/token');

const verificateurService = {
    getAllVerificateurs: async () => {
        try {
            const verificateurs = await Verificateur.find();
            return verificateurs;
        } catch (error) {
            throw new Error( error.message);
        }
    },
    getVerificateurById: async (id) => {
        try {
            const verificateur = await Verificateur.findById(id);
            if (!verificateur) {
                throw new Error('Verificateur not found');
            }
            return verificateur;
        } catch (error) {
            throw new Error(error.message);
        }
    },
    createVerificateur: async (verificateurData) => {
        try {
            const existingVerificateur = await Verificateur.findOne({ email: verificateurData.email });
            if (existingVerificateur) {
                throw new Error('Verificateur with this email already exists');
            }
            const verificateur = new Verificateur(verificateurData);
            await verificateur.save();
            const jwtToken = token(verificateur);
            return {user:verificateur, token: jwtToken};
        } catch (error) {
            throw new Error(error.message);
        }
    },
    updateVerificateur: async (id, verificateurData) => {
        try {
            const verificateur = await Verificateur.findByIdAndUpdate(id, verificateurData, { new: true });
            if (!verificateur) {
                throw new Error('Verificateur not found');
            }
            return verificateur;
        } catch (error) {
            throw new Error( error.message);
        }
    },
    deleteVerificateur: async (id) => {
        try {
            const verificateur = await Verificateur.findByIdAndDelete(id);
            if (!verificateur) {
                throw new Error('Verificateur not found');
            }
            return verificateur;
        } catch (error) {
            throw new Error(error.message);
        }
    },
    loginVerificateur: async (email, password) => {
        try {
            const verificateur = await Verificateur.find({ email, password });
            if (!verificateur) {
                throw new Error('Verificateur not found');
            }
            const jwtToken = token(verificateur);
            return {
                user:verificateur,
                token: jwtToken
            };
        } catch (error) {
            throw new Error( error.message);
        }
    },
    changePassword: async (id, newPassword) => {
        try {
            const verificateur = await Verificateur.findByIdAndUpdate(id, { password: newPassword }, { new: true });
            if (!verificateur) {
                throw new Error('Verificateur not found');
            }
            return verificateur;
        } catch (error) {
            throw new Error( error.message);
        }
    },
     verifierProduit: async (id,verifId) => {
            try {
                const produit = await Produit.findById(id);
                if (!produit) {
                    throw new Error('Produit not found');
                }
                const verificateur = await Verificateur.findById(verifId);
                if (!verificateur) {
                    throw new Error('Verificateur not found');
                }
                produit.verified= true;
                produit.checked_by= verifId;
                await produit.save();
                return produit;
            } catch (error) {
                throw new Error( error.message);
            }
        },
        rejeterProduit: async (id,verifId) => {
            try {
                const produit = await Produit.findById(id);
                if (!produit) {
                    throw new Error('Produit not found');
                }
                const verificateur = await Verificateur.findById(verifId);
                if (!verificateur) {
                    throw new Error('Verificateur not found');
                }
                produit.verified= false;
                produit.checked_by= verifId;
                await produit.save();
                return produit;
            } catch (error) {
                throw new Error( error.message);
            }
        },

}
module.exports = verificateurService;