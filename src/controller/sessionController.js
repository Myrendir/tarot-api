const Session = require('../model/session');
const Game = require('../model/game');

exports.create = async (req, res) => {
    try {
        const session = new Session({
            players: req.body.players,
        });

        await session.save();
        res.status(201).send(session);
    } catch (error) {
        res.status(500).
            send({message: 'Error creating session', error: error.message});
    }
};

exports.get = async (req, res) => {
    try {
        const session = await Session.findById(req.params.id).
            populate('players').
            populate({
                path: 'games',
                populate: {
                    path: 'players.player',
                },
            });

        if (!session) {
            return res.status(404).send({message: 'Session not found'});
        }

        res.send(session);
    } catch (error) {
        res.status(500).
            send({message: 'Error retrieving session', error: error.message});
    }
};

exports.update = async (req, res) => {
    try {
        const session = await Session.findByIdAndUpdate(req.params.id, req.body,
            {new: true});

        if (!session) {
            return res.status(404).send({message: 'Session not found'});
        }

        res.send(session);
    } catch (error) {
        res.status(500).
            send({message: 'Error updating session', error: error.message});
    }
};

exports.delete = async (req, res) => {
    try {
        const session = await Session.findByIdAndDelete(req.params.id);

        if (!session) {
            return res.status(404).send({message: 'Session not found'});
        }

        res.send({message: 'Session successfully deleted'});
    } catch (error) {
        res.status(500).
            send({message: 'Error deleting session', error: error.message});
    }
};

exports.addGameToSession = async (req, res) => {
    try {
        const session = await Session.findById(req.params.sessionId);
        const game = await Game.findById(req.params.gameId);

        if (!session || !game) {
            return res.status(404).send({message: 'Session or Game not found'});
        }

        const gamePlayerIds = game.players.map(p => p.player.toString());
        const sessionPlayerIds = session.players.map(
            playerId => playerId.toString());

        const arePlayersMatching = gamePlayerIds.every(
            id => sessionPlayerIds.includes(id));

        if (!arePlayersMatching) {
            return res.status(400).
                send({message: 'Game players do not match session players'});
        }

        session.games.push(game._id);
        await session.save();

        res.send({message: 'Game added to session successfully'});
    } catch (error) {
        res.status(500).
            send({
                message: 'Error adding game to session',
                error: error.message,
            });
    }
};
