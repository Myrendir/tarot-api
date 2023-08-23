require('dotenv').config();

const secret = process.env.SECRET_KEY;
const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
    const token = req.header('x-auth-token');
    if (!token) {
        return res.status(401).send({ message: 'Access denied. No token provided.' });
    }

    try {
        req.player = jwt.verify(token, secret);
        next();
    } catch (error) {
        res.status(400).send({ message: 'Invalid token' });
    }
}

module.exports = authMiddleware;
