const verificateurService = require('../services/VerificateurService');

const express = require('express');
const VerficateurController = express.Router();

const URL = 'api/verificateur';

router.get(`${URL}/`, async (req, res) => {
    try {
        const verificateurs = await verificateurService.getAllVerificateurs();
        res.status(200).json(verificateurs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
);
router.get(`${URL}/:id`, async (req, res) => {
    try {
        const verificateur = await verificateurService.getVerificateurById(req.params.id);
        res.status(200).json(verificateur);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
);
router.post(`${URL}/`, async (req, res) => {
    try {
        const verificateur = await verificateurService.createVerificateur(req.body);
        res.status(201).json(verificateur);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
);
router.put(`${URL}/:id`, async (req, res) => {
    try {
        const verificateur = await verificateurService.updateVerificateur(req.params.id, req.body);
        res.status(200).json(verificateur);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
);
router.delete(`${URL}/:id`, async (req, res) => {
    try {
        const verificateur = await verificateurService.deleteVerificateur(req.params.id);
        res.status(200).json(verificateur);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
);
router.post(`${URL}/auth/login`, async (req, res) => {
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
router.post(`${URL}/auth/register`, async (req, res) => {
    try {
        const verificateur = await verificateurService.createVerificateur(req.body);
        res.status(201).json(verificateur);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
);


module.exports = VerficateurController;