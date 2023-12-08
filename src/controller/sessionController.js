const {Session, getSeason} = require('../model/session');
const {Game} = require('../model/game');
const Player = require('../model/player');
const {getPoint} = require(
    '../service/tarotCalculator');
const mongoose = require('mongoose');
const sessionController = {};

sessionController.create = async (req, res) => {
    try {
        const session = new Session();
        const players = req.body.players;

        if (!players || players.length !== 5) {
            return res.status(400).
                send({message: 'A session must have 5 players'});

        }
        session.players = players.map((playerId) => {
            return {player: playerId};
        });

        await session.save();
        res.status(201).send(JSON.stringify(session));
    } catch (error) {
        res.status(500).
            send({message: 'Error creating session', error: error.message});
    }
};

sessionController.get = async (req, res) => {
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
            return res.status(404).
                send({message: 'Session not found', _id: req.params.id});
        }

        res.send(session);
    } catch (error) {
        res.status(500).
            send({message: 'Error retrieving session', error: error.message});
    }
};

sessionController.update = async (req, res) => {
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

sessionController.delete = async (req, res) => {
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

sessionController.addGameToSessionAndUpdate = async (req, res) => {
    try {
        const session = await Session.findById(req.params.sessionId);
        const currentSeason = getSeason(new Date());

        if (!session) {
            return res.status(404).send({message: 'Session not found'});
        }

        if (session.season !== currentSeason) {
            return res.status(400).
                send(
                    {message: 'La session n\'est pas dans la saison en cours.'});
        }

        const gameData = req.body;
        if (gameData.partner === '') {
            gameData.partner = null;
        }
        const scores = this.getUpdatedScores(gameData, session);

        const newGame = new Game(scores.game);

        await newGame.save();

        const updatedSession = scores.session;
        updatedSession.games.push(newGame._id);
        await updatedSession.save();

        return res.status(200).json(newGame);
    } catch (err) {
        return res.status(500).
            json({
                message: 'Erreur lors de la mise à jour de la session.',
                error: err.message,
            });
    }
};

sessionController.checkExistingSession = async (req, res) => {
    try {
        const {players} = req.query;

        if (!players || players.length === 0) {
            return res.status(400).send({message: 'Players are required.'});
        }

        const currentSeason = getSeason(new Date());

        const existingSession = await Session.findOne(
            {
                'players.player': {$all: players},
                season: currentSeason,
            },
        );

        if (existingSession) {
            return res.status(200).send({sessionId: existingSession._id});
        } else {
            return res.status(404).send({message: 'No session found.'});
        }
    } catch (error) {
        console.error('Error checking for existing session:', error);
        return res.status(500).send({message: 'Internal server error.'});
    }
};

exports.getUpdatedScores = (game, session) => {
    const point = getPoint(game);

    session.players.forEach(player => {
        if (player.player._id.toString() === game.taker) {
            game.won = point > 0;
            let takerPoints = point;
            if (!game.partner) {
                takerPoints *= 2;
                game.partner = game.taker;
            }
            player.score += takerPoints;
            const takerPlayer = game.players.find(p => p.player.toString() ===
                player.player._id.toString());
            takerPlayer.score = takerPoints;
        } else if (game.partner && player.player._id.toString() ===
            game.partner) {
            player.score += (point / 2);
            game.players.find(p => p.player.toString() ===
                player.player._id.toString()).score = point / 2;
        } else {
            player.score -= point / 2;
            game.players.find(p => p.player.toString() ===
                player.player._id.toString()).score = -point / 2;
        }
    });

    return {session, game};
};

sessionController.count = async (req, res) => {
    try {
        const count = await Session.countDocuments();
        res.send({count});
    } catch (error) {
        res.status(500).
            send({message: 'Error counting sessions', error: error.message});
    }
};

sessionController.deleteLastGameOfSession = async (req, res) => {
    try {
        const sessionId = req.params.id;

        const session = await Session.findById(sessionId).populate('games');
        if (!session) {
            return res.status(404).json({message: 'Session not found.'});
        }

        if (session.games.length === 0) {
            return res.status(400).
                json({message: 'No games in this session to delete.'});
        }

        const lastGame = session.games[session.games.length - 1];

        session.players.forEach(player => {
            const gamePlayer = lastGame.players.find(
                p => p.player.toString() === player.player._id.toString());
            if (gamePlayer) {
                player.score -= gamePlayer.score;
            }
        });

        session.games.pop();

        await session.save();

        await Game.findByIdAndRemove(lastGame._id);

        res.status(200).
            json(
                {message: 'Last game of session deleted and scores updated successfully.'});
    } catch (error) {
        res.status(500).json({
            message: 'Error deleting the last game of the session and updating scores',
            error: error.message,
        });
    }
};

sessionController.addStar = async (req, res) => {
    try {
        const guiltyType = req.body.type;
        const playerId = req.params.playerId;
        const sessionId = req.params.sessionId;

        console.log('guiltyType', guiltyType);
        console.log('playerId', playerId);
        console.log('sessionId', sessionId);
        const session = await Session.findById(sessionId);
        if (!session) {
            return res.status(404).json({message: 'Session not found.'});
        }

        const player = await Player.findById(playerId);
        if (!player) {
            return res.status(404).json({message: 'Player not found.'});
        }

        player.stars.push({type: guiltyType, date: new Date()});
        await player.save();

        const isThirdStar = (player.stars.length % 3 === 0);
        if (isThirdStar) {
            session.players.forEach(p => {
                if (p.player.toString() === player._id.toString()) {
                    p.score -= 100;
                } else {
                    p.score += 25;
                }
            });
        }

        await session.save();
        res.status(200).json({message: 'Star added successfully.'});

    } catch (error) {
        res.status(500).
            json({message: 'Error adding star', error: error.message});
    }
};

sessionController.getLatestSessions = async (req, res) => {
    try {
        const latestSessions = await Session.find().
            sort({updatedAt: -1}).
            limit(5);

        console.log('latestSessions', latestSessions);
        res.status(200).json(latestSessions);
    } catch (error) {
        res.status(500).
            json({
                message: 'Error retrieving latest sessions',
                error: error.message,
            });
    }
};

module.exports = sessionController;

