const fournisseurService = require('../services/FournisseurService');
const express = require('express');
const FournisseurController = express.Router();
const verifyToken = require('../config/middleware');

const { handleResponse, handleError } = require('../utils/responseHandler');

FournisseurController.get(`/`, verifyToken, async (req, res) => {
    try {
        const response = await fournisseurService.getAllFournisseurs();
        handleResponse(res, response);
    } catch (error) {
        handleError(res, error);
    }
});

FournisseurController.get(`/:id`, verifyToken, async (req, res) => {
    try {
        const response = await fournisseurService.getFournisseurById(req.params.id);
        handleResponse(res, response);
    } catch (error) {
        handleError(res, error);
    }
});

FournisseurController.post(`/`, async (req, res) => {
    try {
        const response = await fournisseurService.createFournisseur(req.body);
        handleResponse(res, response);
    } catch (error) {
        handleError(res, error);
    }
});

FournisseurController.put(`/:id`, verifyToken, async (req, res) => {
    try {
        const response = await fournisseurService.updateFournisseur(req.params.id, req.body);
        handleResponse(res, response);
    } catch (error) {
        handleError(res, error);
    }
});

FournisseurController.delete(`/:id`, verifyToken, async (req, res) => {
    try {
        const response = await fournisseurService.deleteFournisseur(req.params.id);
        handleResponse(res, response);
    } catch (error) {
        handleError(res, error);
    }
});

FournisseurController.post(`/auth/login`, async (req, res) => {
    try {
        const { email, password } = req.body;
        const response = await fournisseurService.loginFournisseur(email, password);
        handleResponse(res, response);
    } catch (error) {
        handleError(res, error);
    }
});

FournisseurController.post(`/auth/verify`, async (req, res) => {
    try {
        const { email, password } = req.body;
        const response = await fournisseurService.verifyFournisseur(email, password);
        handleResponse(res, response);
    } catch (error) {
        handleError(res, error);
    }
});

FournisseurController.put(`/metrics/:id`, verifyToken, async (req, res) => {
    try {
        const response = await fournisseurService.updateFournisseurMetrics(req.params.id);
        handleResponse(res, response);
    } catch (error) {
        handleError(res, error);
    }
});

FournisseurController.get(`/stats/:id`, verifyToken, async (req, res) => {
    try {
        const response = await fournisseurService.getFournisseurWithStats(req.params.id);
        handleResponse(res, response);
    } catch (error) {
        handleError(res, error);
    }
});

module.exports = FournisseurController;