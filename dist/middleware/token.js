"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const createToken = (user) => {
    const payload = {
        id: user._id,
        username: user.nom,
        email: user.email,
        role: user.role || 'fournisseur', // Default to fournisseur if not specified
    };
    const secret = process.env.JWT_SECRET;
    return jsonwebtoken_1.default.sign(payload, secret, { expiresIn: "7d" });
};
exports.createToken = createToken;
//# sourceMappingURL=token.js.map