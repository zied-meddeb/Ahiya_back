import { Request, Response, NextFunction } from 'express';
const jwt = require('jsonwebtoken');

interface JwtPayload {
    id: string;
    username: string;
    email: string;
    iat?: number;
    exp?: number;
}

export const verifyToken = (req: Request & { user?: JwtPayload }, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
        req.user = decoded;
        next();
    } catch (err) {
        res.status(403).json({ message: 'Invalid token.' });
    }
};