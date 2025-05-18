const fournisseurService = require('../services/FournisseurService');
const express = require('express');
const FournisseurController = express.Router();
const verifyToken = require('../config/middleware');

FournisseurController.get(`/`,verifyToken, async (req, res) => {
    try {
        const fournisseurs = await fournisseurService.getAllFournisseurs();
        res.status(200).json(fournisseurs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
);
FournisseurController.get(`/:id`,verifyToken, async (req, res) => {
    try {
        const fournisseur = await fournisseurService.getFournisseurById(req.params.id);
        res.status(200).json(fournisseur);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
);
FournisseurController.post(`/`, async (req, res) => {
    try {
        const fournisseur = await fournisseurService.createFournisseur(req.body);
        res.status(201).json(fournisseur);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
);
FournisseurController.put(`/:id`, verifyToken, async (req, res) => {
    try {
        const fournisseur = await fournisseurService.updateFournisseur(req.params.id, req.body);
        res.status(200).json(fournisseur);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
);
FournisseurController.delete(`/:id`,verifyToken, async (req, res) => {
    try {
        const fournisseur = await fournisseurService.deleteFournisseur(req.params.id);
        res.status(200).json(fournisseur);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
);
FournisseurController.post(`/auth/login`, async (req, res) => {
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

FournisseurController.post(`/auth/verify`, async (req, res) => {
    try {
        const { email, password } = req.body;
        const fournisseur = await fournisseurService.verifyFournisseur(email, password);
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