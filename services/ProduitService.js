const Produit= require('../entities/Produit');

const produitService = {
    getAllProduits: async () => {
        try {
            const produits = await Produit.find();
            return produits;
        } catch (error) {
            throw new Error('Error fetching produits: ' + error.message);
        }
    },

    getProduitById: async (id) => {
        try {
            const produit = await Produit.findById(id);
            if (!produit) {
                throw new Error('Produit not found');
            }
            return produit;
        } catch (error) {
            throw new Error('Error fetching produit: ' + error.message);
        }
    },

    createProduit: async (produitData) => {
        try {
            const produit = new Produit(produitData);
            await produit.save();
            return produit;
        } catch (error) {
            throw new Error('Error creating produit: ' + error.message);
        }
    },

    updateProduit: async (id, produitData) => {
        try {
            const produit = await Produit.findByIdAndUpdate(id, produitData, { new: true });
            if (!produit) {
                throw new Error('Produit not found');
            }
            return produit;
        } catch (error) {
            throw new Error('Error updating produit: ' + error.message);
        }
    },

    deleteProduit: async (id) => {
        try {
            const produit = await Produit.findByIdAndDelete(id);
            if (!produit) {
                throw new Error('Produit not found');
            }
            return produit;
        } catch (error) {
            throw new Error('Error deleting produit: ' + error.message);
        }
    }
}

module.exports = produitService;