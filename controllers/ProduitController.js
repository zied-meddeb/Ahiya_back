const produitService = require('../services/ProduitService');
const express = require('express');
const ProduitController = express.Router();
const verifyToken = require('../config/middleware');

ProduitController.get(`/`, async (req, res) => {
    try {
        const produits = await produitService.getAllProduits();
        res.status(200).json(produits);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
ProduitController.get(`/:id`, async (req, res) => {
    try {
        const produit = await produitService.getProduitById(req.params.id);
        res.status(200).json(produit);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
ProduitController.post(`/`,verifyToken, async (req, res) => {
    try {
        const produit = await produitService.createProduit(req.body);
        res.status(201).json(produit);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
ProduitController.put(`/:id`,verifyToken, async (req, res) => {
    try {
        const produit = await produitService.updateProduit(req.params.id, req.body);
        res.status(200).json(produit);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
ProduitController.delete(`/:id`,verifyToken, async (req, res) => {
    try {
        const produit = await produitService.deleteProduit(req.params.id);
        res.status(200).json(produit);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
ProduitController.get(`/search/criteria`, async (req, res) => {
    try {
        const  criteria  = req.query;
        const produits = await produitService.searchByCriteria(criteria);
        res.status(200).json(produits);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = ProduitController;