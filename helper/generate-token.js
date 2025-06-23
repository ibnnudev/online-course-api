const crypto = require('crypto')
const jwt = require('jsonwebtoken');
require('dotenv').config();

const EXPIRATION_TIME = '1d';

const generateToken = (user) => {
    if (!user || !user.id) {
        throw new Error('User object with an id is required to generate a token');
    }

    const payload = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
    };

    const secretKey = process.env.JWT_SECRET_KEY;
    if (!secretKey) {
        throw new Error('JWT secret key is not defined in environment variables');
    }

    const token = jwt.sign(payload, secretKey, {expiresIn: EXPIRATION_TIME});
    return token;
}

module.exports = generateToken;