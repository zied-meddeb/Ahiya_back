const Verificateur = require('../entities/Verificateur');

const verificateurService = {
    getAllVerificateurs: async () => {
        try {
            const verificateurs = await Verificateur.find();
            return verificateurs;
        } catch (error) {
            throw new Error('Error fetching verificateurs: ' + error.message);
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
            throw new Error('Error fetching verificateur: ' + error.message);
        }
    },
    createVerificateur: async (verificateurData) => {
        try {
            const verificateur = new Verificateur(verificateurData);
            await verificateur.save();
            return verificateur;
        } catch (error) {
            throw new Error('Error creating verificateur: ' + error.message);
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
            throw new Error('Error updating verificateur: ' + error.message);
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
            throw new Error('Error deleting verificateur: ' + error.message);
        }
    },
    loginVerificateur: async (email, password) => {
        try {
            const verificateur = await Verificateur.find({ email, password });
            if (!verificateur) {
                throw new Error('Verificateur not found');
            }
            return verificateur;
        } catch (error) {
            throw new Error('Error logging in verificateur: ' + error.message);
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
            throw new Error('Error changing password: ' + error.message);
        }
    }

}
module.exports = verificateurService;