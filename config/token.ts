const jwt = require('jsonwebtoken');


export const createToken = (user:any): string => {
    const payload = {
        id: user._id,
        username: user.nom,
        email: user.email,
    };

    const secret = process.env.JWT_SECRET as string;
    return jwt.sign(payload, secret, { expiresIn: '7d' });
};