"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createToken = void 0;
const jwt = require('jsonwebtoken');
const createToken = (user) => {
    const payload = {
        id: user._id,
        username: user.nom,
        email: user.email,
    };
    const secret = process.env.JWT_SECRET;
    return jwt.sign(payload, secret, { expiresIn: '7d' });
};
exports.createToken = createToken;
