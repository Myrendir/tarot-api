require('dotenv').config();
const Player = require('../model/player');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const secret = process.env.SECRET_KEY;
const securityController = {};

securityController.login = async (req, res) => {
    try {
        const player = await Player.findOne({username: req.body.username});
        if (!player) {
            return res.status(401).send({message: 'Authentication failed'});
        }

        const validPassword = await bcrypt.compare(req.body.password,
            player.password);
        if (!validPassword) {
            return res.status(401).send({message: 'Authentication failed'});
        }

        const token = jwt.sign({playerId: player._id}, secret,
            {expiresIn: '1h'});
        res.send({token: token});
    } catch (error) {
        res.status(500).
            send({message: 'Error logging in', error: error.message});
    }
};

module.exports = securityController;