"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyUserRole = exports.verifyFournisseurRole = exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const verifyToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
        return res
            .status(401)
            .json({ message: "Access denied. No token provided." });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (err) {
        res.status(403).json({ message: "Invalid token." });
    }
};
exports.verifyToken = verifyToken;
const verifyFournisseurRole = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: "Access denied. No user found." });
    }
    if (req.user.role !== 'fournisseur') {
        return res.status(403).json({ message: "Access denied. Fournisseur role required." });
    }
    next();
};
exports.verifyFournisseurRole = verifyFournisseurRole;
const verifyUserRole = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: "Access denied. No user found." });
    }
    if (req.user.role !== 'user') {
        return res.status(403).json({ message: "Access denied. User role required." });
    }
    next();
};
exports.verifyUserRole = verifyUserRole;
//# sourceMappingURL=middleware.js.map