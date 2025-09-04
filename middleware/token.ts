import jwt from "jsonwebtoken";
export const createToken = (user: any): string => {
  const payload = {
    id: user._id,
    username: user.nom,
    email: user.email,
    role: user.role || 'fournisseur', // Default to fournisseur if not specified
  };

  const secret = process.env.JWT_SECRET as string;
  return jwt.sign(payload, secret, { expiresIn: "7d" });
};
