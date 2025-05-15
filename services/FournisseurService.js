const Fournisseur = require('../entities/Fournisseur');

const fournisseurService = {
    getAllFournisseurs: async () => {
        try {
            const fournisseurs = await Fournisseur.find();
            return fournisseurs;
        } catch (error) {
            throw new Error('Error fetching fournisseurs: ' + error.message);
        }
    },

    getFournisseurById: async (id) => {
        try {
            const fournisseur = await Fournisseur.findById(id);
            if (!fournisseur) {
                throw new Error('Fournisseur not found');
            }
            return fournisseur;
        } catch (error) {
            throw new Error('Error fetching fournisseur: ' + error.message);
        }
    },
    createFournisseur: async (fournisseurData) => {
        try {
            const fournisseur = new Fournisseur(fournisseurData);
            await fournisseur.save();
            return fournisseur;
        } catch (error) {
            throw new Error('Error creating fournisseur: ' + error.message);
        }
    },
    updateFournisseur: async (id, fournisseurData) => {
        try {
            const fournisseur = await Fournisseur.findByIdAndUpdate(id, fournisseurData, { new: true });
            if (!fournisseur) {
                throw new Error('Fournisseur not found');
            }
            return fournisseur;
        } catch (error) {
            throw new Error('Error updating fournisseur: ' + error.message);
        }
    }
    ,
    deleteFournisseur: async (id) => {
        try {
            const fournisseur = await Fournisseur.findByIdAndDelete(id);
            if (!fournisseur) {
                throw new Error('Fournisseur not found');
            }
            return fournisseur;
        } catch (error) {
            throw new Error('Error deleting fournisseur: ' + error.message);
        }
    },

    loginFournisseur: async (email, password) => {
        try {
            const fournisseur = await Fournisseur.findOne({
                email: email,
                password: password
            });
            if (!fournisseur) {
                throw new Error('Invalid credentials');
            }
            return fournisseur;
        } catch (error) {
            throw new Error('Error logging in fournisseur: ' + error.message);
        }
    }
}
module.exports = fournisseurService;