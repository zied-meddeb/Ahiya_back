const Favoris= require('../entities/Favoris');
const FavorisService = {
    getAllFavoris: async () => {
        try {
            const favoris = await Favoris.find().populate('userId').populate('produitId');
            return favoris;
        } catch (error) {
            throw new Error(error.message);
        }
    },

    getFavorisByUserId: async (userId) => {
        try {
            const favoris = await Favoris.find({ userId }).populate('produitId');
            return favoris;
        } catch (error) {
            throw new Error(error.message);
        }
    },

    addFavoris: async (favorisData) => {
        try {
            const favoris = new Favoris(favorisData);
            await favoris.save();
            return favoris;
        } catch (error) {
            throw new Error(error.message);
        }
    },

    removeFavoris: async (id) => {
        try {
            const favoris = await Favoris.findByIdAndDelete(id);
            if (!favoris) {
                throw new Error('Favoris not found');
            }
            return favoris;
        } catch (error) {
            throw new Error(error.message);
        }
    }
};

module.exports = FavorisService;