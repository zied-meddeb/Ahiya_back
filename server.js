const express = require('express');
const app = express();
const port=3000;

app.use(express.json());
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

const categoryController = require('./controllers/CategoryController');
app.use('/api/category', categoryController);

const produitController = require('./controllers/ProduitController');
app.use('/api/produit', produitController);

const verificateurController = require('./controllers/VerificateurController');
app.use('/api/verificateur', verificateurController);

const fournisseurController = require('./controllers/FournisseurController');
app.use('/api/fournisseur', fournisseurController);


const mongo=require('./config/dbConfig');
mongo();