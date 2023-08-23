require('dotenv').config();

const secret = process.env.SECRET_KEY;
const jwt = require('jsonwebtoken');
const Player = require('../model/player');

const isAdmin = async (req, res, next) => {
    try {
        const token = req.header('x-auth-token');

        if (!token) {
            return res.status(401).
                send({message: 'Access denied. No token provided.'});
        }

        const decoded = jwt.verify(token, secret);
        req.playerId = decoded.playerId;

        const player = await Player.findById(req.playerId);
        if (!player) {
            return res.status(404).send({message: 'No player found.'});
        }

        if (player.role !== 'ADMIN') {
            return res.status(403).
                send({message: 'Access denied. You are not an admin.'});
        }

        next();
    } catch (error) {
        res.status(400).send({message: 'Invalid token'});
    }
};

module.exports = isAdmin;
