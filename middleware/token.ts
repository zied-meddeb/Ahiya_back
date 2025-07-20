const jwt = import('jsonwebtoken');


export const createToken = async (user:any): Promise<string> => {
    const payload = {
        id: user._id,
        username: user.nom,
        email: user.email,
        role: user.role,
    };

    const secret = process.env.JWT_SECRET as string;
    return (await jwt).sign(payload, secret, { expiresIn: '7d' });
};