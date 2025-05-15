const produitService = require('../services/produitService');
const express = require('express');
const ProduitController = express.Router();

const URL = 'api/produit';
ProduitController.get(`${URL}/`, async (req, res) => {
    try {
        const produits = await produitService.getAllProduits();
        res.status(200).json(produits);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
ProduitController.get(`${URL}/:id`, async (req, res) => {
    try {
        const produit = await produitService.getProduitById(req.params.id);
        res.status(200).json(produit);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
ProduitController.post(`${URL}/`, async (req, res) => {
    try {
        const produit = await produitService.createProduit(req.body);
        res.status(201).json(produit);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
ProduitController.put(`${URL}/:id`, async (req, res) => {
    try {
        const produit = await produitService.updateProduit(req.params.id, req.body);
        res.status(200).json(produit);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
ProduitController.delete(`${URL}/:id`, async (req, res) => {
    try {
        const produit = await produitService.deleteProduit(req.params.id);
        res.status(200).json(produit);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = ProduitController;