import express, { Application } from 'express';

import categoryController from './controllers/CategoryController';
import produitController from './controllers/ProduitController';
import verificateurController from './controllers/VerificateurController';
import fournisseurController from './controllers/FournisseurController';
import userController from './controllers/UserController';
import promotionController from './controllers/PromotionController';
import favorisController from './controllers/FavorisController';
import connectDB from './config/dbConfig';

const app: Application = express();
const port = 3100;

app.use(express.json());

app.use('/api/category', categoryController);
app.use('/api/produit', produitController);
app.use('/api/verificateur', verificateurController);
app.use('/api/fournisseur', fournisseurController);
app.use('/api/user', userController);
app.use('/api/promotion', promotionController);
app.use('/api/favoris', favorisController);

connectDB();

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});