"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const CategoryController_1 = __importDefault(require("./controllers/CategoryController"));
const ProduitController_1 = __importDefault(require("./controllers/ProduitController"));
const VerificateurController_1 = __importDefault(require("./controllers/VerificateurController"));
const FournisseurController_1 = __importDefault(require("./controllers/FournisseurController"));
const UserController_1 = __importDefault(require("./controllers/UserController"));
const PromotionController_1 = __importDefault(require("./controllers/PromotionController"));
const FavorisController_1 = __importDefault(require("./controllers/FavorisController"));
const dbConfig_1 = __importDefault(require("./config/dbConfig"));
const app = (0, express_1.default)();
const port = 3100;
app.use(express_1.default.json());
app.use('/api/category', CategoryController_1.default);
app.use('/api/produit', ProduitController_1.default);
app.use('/api/verificateur', VerificateurController_1.default);
app.use('/api/fournisseur', FournisseurController_1.default);
app.use('/api/user', UserController_1.default);
app.use('/api/promotion', PromotionController_1.default);
app.use('/api/favoris', FavorisController_1.default);
(0, dbConfig_1.default)();
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
