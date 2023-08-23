const Game = require('../model/game');
const BET_VALUES = require('../model/game').BET_VALUES;

exports.create = async (req, res) => {
    try {
        const game = new Game(req.body);

        if (!BET_VALUES.includes(game.bet)) {
            return res.status(400).send({ message: 'Invalid bet value' });
        }

        await game.save();
        res.status(201).send(game);
    } catch (error) {
        res.status(500).send({ message: 'Error creating game', error: error.message });
    }
};

exports.get = async (req, res) => {
    try {
        const game = await Game.findById(req.params.id).populate('players.player').populate('taker').populate('caller');

        if (!game) {
            return res.status(404).send({ message: 'Game not found' });
        }

        res.send(game);
    } catch (error) {
        res.status(500).send({ message: 'Error retrieving game', error: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const game = await Game.findByIdAndUpdate(req.params.id, req.body, { new: true });

        if (!game) {
            return res.status(404).send({ message: 'Game not found' });
        }

        res.send(game);
    } catch (error) {
        res.status(500).send({ message: 'Error updating game', error: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const game = await Game.findByIdAndDelete(req.params.id);

        if (!game) {
            return res.status(404).send({ message: 'Game not found' });
        }

        res.send({ message: 'Game successfully deleted' });
    } catch (error) {
        res.status(500).send({ message: 'Error deleting game', error: error.message });
    }
};
