const jwt = require('jsonwebtoken');
require('dotenv').config();

const getUserFromToken = (authHeader) => {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }

    const token = authHeader.replace('Bearer ', '').trim();
    try {
        return jwt.verify(token, process.env.JWT_SECRET_KEY);
    } catch (err) {
        console.error('Invalid token:', err.message);
        return null;
    }
};

module.exports = getUserFromToken;
