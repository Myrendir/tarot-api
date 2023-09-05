require('dotenv').config();

const secret = process.env.SECRET_KEY;
const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).send({ message: 'No token provided.' });
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2) {
        return res.status(401).send({ message: 'Token error.' });
    }

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme)) {
        return res.status(401).send({ message: 'Token malformatted.' });
    }

    jwt.verify(token, secret, (err, decoded) => {
        if (err) return res.status(401).send({ message: 'Invalid token.' });

        req.userId = decoded.id;
        return next();
    });
}

module.exports = authMiddleware;
