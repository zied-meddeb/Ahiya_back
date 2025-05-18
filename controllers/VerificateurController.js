const verificateurService = require('../services/VerificateurService');
const verifyToken = require('../config/middleware');
const express = require('express');
const VerficateurController = express.Router();


VerficateurController.get(`/`,verifyToken, async (req, res) => {
    try {
        const verificateurs = await verificateurService.getAllVerificateurs();
        res.status(200).json(verificateurs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
);
VerficateurController.get(`/:id`,verifyToken, async (req, res) => {
    try {
        const verificateur = await verificateurService.getVerificateurById(req.params.id);
        res.status(200).json(verificateur);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
);

VerficateurController.put(`/:id`,verifyToken, async (req, res) => {
    try {
        const verificateur = await verificateurService.updateVerificateur(req.params.id, req.body);
        res.status(200).json(verificateur);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
);
VerficateurController.delete(`/:id`,verifyToken, async (req, res) => {
    try {
        const verificateur = await verificateurService.deleteVerificateur(req.params.id);
        res.status(200).json(verificateur);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
);
VerficateurController.post(`/auth/login`, async (req, res) => {
    try {
        const { email, password } = req.body;
        const verificateur = await verificateurService.loginVerificateur(email, password);
        if (!verificateur) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        res.status(200).json(verificateur);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
);
VerficateurController.post(`/auth/register`, async (req, res) => {
    try {
        const verificateur = await verificateurService.createVerificateur(req.body);
        res.status(201).json(verificateur);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
);



VerficateurController.post(`/:id/verifier/:verifId`,verifyToken, async (req, res) => {
    try {
        const produit = await verificateurService.verifierProduit(req.params.id, req.params.verifId);
        res.status(200).json(produit);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
VerficateurController.post(`/:id/rejeter/:verifId`,verifyToken, async (req, res) => {
    try {
        const produit = await verificateurService.rejeterProduit(req.params.id, req.params.verifId);
        res.status(200).json(produit);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


module.exports = VerficateurController;