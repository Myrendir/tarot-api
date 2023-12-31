const {Game, BET_VALUES} = require('../model/game');
const gameController = {};
gameController.create = async (req, res) => {
    try {
        const game = new Game(req.body);

        if (!BET_VALUES.includes(game.bet)) {
            return res.status(400).send({message: 'Invalid bet value'});
        }

        await game.save();
        res.status(201).send(game);
    } catch (error) {
        res.status(500).
            send({message: 'Error creating game', error: error.message});
    }
};

gameController.get = async (req, res) => {
    try {
        const game = await Game.findById(req.params.id).
            populate('players.player').
            populate('taker').
            populate('caller');

        if (!game) {
            return res.status(404).send({message: 'Game not found'});
        }

        res.send(game);
    } catch (error) {
        res.status(500).
            send({message: 'Error retrieving game', error: error.message});
    }
};

gameController.update = async (req, res) => {
    try {
        const game = await Game.findByIdAndUpdate(req.params.id, req.body,
            {new: true});

        if (!game) {
            return res.status(404).send({message: 'Game not found'});
        }

        res.send(game);
    } catch (error) {
        res.status(500).
            send({message: 'Error updating game', error: error.message});
    }
};

gameController.delete = async (req, res) => {
    try {
        const game = await Game.findByIdAndDelete(req.params.id);

        if (!game) {
            return res.status(404).send({message: 'Game not found'});
        }

        res.send({message: 'Game successfully deleted'});
    } catch (error) {
        res.status(500).
            send({message: 'Error deleting game', error: error.message});
    }
};

gameController.count = async (req, res) => {
    try {
        const count = await Game.countDocuments();

        res.send({count});
    } catch (error) {
        res.status(500).
            send({message: 'Error counting games', error: error.message});
    }
};

gameController.getGamesWithNonZeroScores = async (req, res) => {
    try {
        const games = await Game.aggregate([
            {
                $unwind: '$players',
            },
            {
                $group: {
                    _id: '$_id',
                    totalScore: { $sum: '$players.score' },
                },
            },
            {
                $match: { totalScore: { $ne: 0 } },
            },
            {
                $lookup: {
                    from: 'games',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'gameDetails',
                },
            },
            {
                $unwind: '$gameDetails',
            },
            {
                $replaceRoot: { newRoot: '$gameDetails' },
            }
        ]);

        res.json(games);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch games with non-zero scores.' });
    }
};

gameController.getLatestGame = async (req, res) => {
    try {
        const game = await Game.find().sort({ _id: -1 }).limit(1);

        res.json(game);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch latest game.' });
    }
}

module.exports = gameController;