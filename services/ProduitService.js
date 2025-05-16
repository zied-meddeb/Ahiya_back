const Produit= require('../entities/Produit');
const Category= require('../entities/Category');
const Verificateur = require('../entities/Verificateur');
const Fournisseur = require('../entities/Fournisseur');

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
            throw new Error('Error verifying produit: ' + error.message);
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
            throw new Error('Error rejecting produit: ' + error.message);
        }
    },
     searchByCriteria: async (criteria = {}) => {
    try {
        const query = {};
        
       
        
            if (typeof criteria.priceMin !== 'undefined') {
                query.prix = query.prix || {};
                query.prix.$gte = Number(criteria.priceMin);
            }
            if (typeof criteria.priceMax !== 'undefined') {
                query.prix = query.prix || {};
                query.prix.$lte = Number(criteria.priceMax);
            }
            
            
            let category = {};
        if (typeof criteria.category !== 'undefined') {
            const categories = await Category.find({ 
                nom: { $regex: criteria.category, $options: 'i' } 
            });
            category = { category: { $in: categories.map(c => c._id) } };
        }

           let fournisseur = {};
        if (typeof criteria.fournisseur !== 'undefined') {
            const fournisseurs = await Fournisseur.find({ 
                nom: { $regex: criteria.fournisseur, $options: 'i' } 
            });
            fournisseur = { fournisseur: { $in: fournisseurs.map(c => c._id) } };
        }

            if (typeof criteria.status !== 'undefined') {
                query.status = criteria.status;
            }
            if (typeof criteria.verified !== 'undefined') {
                query.verified = criteria.verified;
            }
            if (typeof criteria.nom !== 'undefined') {
                query.nom = { $regex: criteria.nom, $options: 'i' }; 
            }

        
         const produits = await Produit.find({ ...query, ...category,...fournisseur })
            .populate({
                path: 'category',
                select: 'nom' 
            })  
            .populate('fournisseur');
        
        return produits;
    } catch (error) {
        throw new Error('Error searching produits: ' + error.message);
    }
}

    
}

module.exports = produitService;