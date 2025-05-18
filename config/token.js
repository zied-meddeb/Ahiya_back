const jwt = require('jsonwebtoken');

const createToken = (user) => {
    const payload = {
        id: user._id,
        username: user.nom,
        email: user.email,
    };

    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
}
module.exports = createToken;