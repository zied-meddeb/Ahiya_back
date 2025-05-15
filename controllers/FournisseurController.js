const fournisseurService = require('../services/FournisseurService');
const express = require('express');
const FournisseurController = express.Router();
const URL = 'api/fournisseur';

FournisseurController.get(`${URL}/`, async (req, res) => {
    try {
        const fournisseurs = await fournisseurService.getAllFournisseurs();
        res.status(200).json(fournisseurs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
);
FournisseurController.get(`${URL}/:id`, async (req, res) => {
    try {
        const fournisseur = await fournisseurService.getFournisseurById(req.params.id);
        res.status(200).json(fournisseur);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
);
FournisseurController.post(`${URL}/`, async (req, res) => {
    try {
        const fournisseur = await fournisseurService.createFournisseur(req.body);
        res.status(201).json(fournisseur);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
);
FournisseurController.put(`${URL}/:id`, async (req, res) => {
    try {
        const fournisseur = await fournisseurService.updateFournisseur(req.params.id, req.body);
        res.status(200).json(fournisseur);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
);
FournisseurController.delete(`${URL}/:id`, async (req, res) => {
    try {
        const fournisseur = await fournisseurService.deleteFournisseur(req.params.id);
        res.status(200).json(fournisseur);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
);
FournisseurController.post(`${URL}/auth/login`, async (req, res) => {
    try {
        const { email, password } = req.body;
        const fournisseur = await fournisseurService.loginFournisseur(email, password);
        if (!fournisseur) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        res.status(200).json(fournisseur);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
);

module.exports = FournisseurController;