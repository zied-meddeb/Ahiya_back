import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
  id: string;
  username: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export const verifyToken = (
  req: Request & { user?: JwtPayload },
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid token." });
  }
};

export const verifyFournisseurRole = (
  req: Request & { user?: JwtPayload },
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ message: "Access denied. No user found." });
  }
  
  if (req.user.role !== 'fournisseur') {
    return res.status(403).json({ message: "Access denied. Fournisseur role required." });
  }
  
  next();
};

export const verifyUserRole = (
  req: Request & { user?: JwtPayload },
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ message: "Access denied. No user found." });
  }
  
  if (req.user.role !== 'user') {
    return res.status(403).json({ message: "Access denied. User role required." });
  }
  
  next();
};