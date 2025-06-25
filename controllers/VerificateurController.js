const verificateurService = require('../services/VerificateurService');
const verifyToken = require('../config/middleware');
const express = require('express');
const VerficateurController = express.Router();

const { handleResponse, handleError } = require('../utils/responseHandler');

VerficateurController.get(`/`, verifyToken, async (req, res) => {
    try {
        const verificateurs = await verificateurService.getAllVerificateurs();
        handleResponse(res, verificateurs);
    } catch (error) {
        handleError(res, error);
    }
});

VerficateurController.get(`/:id`, verifyToken, async (req, res) => {
    try {
        const verificateur = await verificateurService.getVerificateurById(req.params.id);
        handleResponse(res, verificateur);
    } catch (error) {
        handleError(res, error);
    }
});

VerficateurController.put(`/:id`, verifyToken, async (req, res) => {
    try {
        const verificateur = await verificateurService.updateVerificateur(req.params.id, req.body);
        handleResponse(res, verificateur);
    } catch (error) {
        handleError(res, error);
    }
});

VerficateurController.delete(`/:id`, verifyToken, async (req, res) => {
    try {
        const verificateur = await verificateurService.deleteVerificateur(req.params.id);
        handleResponse(res, verificateur);
    } catch (error) {
        handleError(res, error);
    }
});

VerficateurController.post(`/auth/login`, async (req, res) => {
    try {
        const { email, password } = req.body;
        const verificateur = await verificateurService.loginVerificateur(email, password);
        if (!verificateur) {
            return handleError(res, new Error('Invalid credentials'));
        }
        handleResponse(res, verificateur);
    } catch (error) {
        handleError(res, error);
    }
});

VerficateurController.post(`/auth/register`, async (req, res) => {
    try {
        const verificateur = await verificateurService.createVerificateur(req.body);
        handleResponse(res, verificateur);
    } catch (error) {
        handleError(res, error);
    }
});

VerficateurController.post(`/:id/verifier/:verifId`, verifyToken, async (req, res) => {
    try {
        const produit = await verificateurService.verifierProduit(req.params.id, req.params.verifId);
        handleResponse(res, produit);
    } catch (error) {
        handleError(res, error);
    }
});

VerficateurController.post(`/:id/rejeter/:verifId`, verifyToken, async (req, res) => {
    try {
        const produit = await verificateurService.rejeterProduit(req.params.id, req.params.verifId);
        handleResponse(res, produit);
    } catch (error) {
        handleError(res, error);
    }
});

module.exports = VerficateurController;