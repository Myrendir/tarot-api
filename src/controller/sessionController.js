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

        const existingSession = await Session.find({
            'players.player': {$all: players},
            season: currentSeason,
        }, {}, {limit: 1});

        if (existingSession) {
            return res.status(200).send({sessionId: existingSession[0]._id});
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

    let creditedPoints = 0;
    game.won = point > 0;
    session.players.forEach(player => {
        console.log('Updating score for player', player.player._id.toString());
        if (player.player._id.toString() === game.taker) {
            return;
        }
        const isPartner = game.partner && player.player._id.toString() ===
            game.partner;
        const playerGameScore = point * (isPartner ? 1 : -1);

        if (!player || player.score === undefined) {
            console.error('Player not found or score undefined', player);
            return;
        }

        player.score += playerGameScore;

        const gamePlayer = game.players.find(p => p.player.toString() ===
            player.player._id.toString());

        if (gamePlayer) {
            gamePlayer.score = playerGameScore;
        } else {
            console.error('Game player not found', gamePlayer);
        }

        creditedPoints += playerGameScore;

    });

    const taker = session.players.find(p => p.player._id.toString() ===
        game.taker);

    if (taker && taker.score !== undefined) {
        taker.score += creditedPoints;
    } else {
        console.error('Taker not found or score undefined', taker);
    }

    const takerInGame = game.players.find(p => p.player.toString() ===
        game.taker);

    if (takerInGame) {
        takerInGame.score = -creditedPoints;
    } else {
        console.error('Taker in game not found', takerInGame);
    }

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

        res.status(200).json(latestSessions);
    } catch (error) {
        res.status(500).
            json({
                message: 'Error retrieving latest sessions',
                error: error.message,
            });
    }
};

sessionController.recalculateScores = async (req, res) => {
    try {
        console.log('Starting recalculating scores...');
        const sessions = await Session.find().populate({
            path: 'games',
            populate: {
                path: 'players.player',
            },
        });

        console.log('Found', sessions.length, 'sessions to recalculate.');
        for (const session of sessions) {
            console.log('Recalculating scores for session',
                session._id.toString());
            const originalStarScores = session.players.map(player => ({
                playerId: player.player._id.toString(),
                starScore: player.score,
            }));

            session.players.forEach(player => {
                player.score = 0;
            });

            for (const game of session.games) {
                console.log('Recalculating scores for game',
                    game._id.toString());
                const updatedScores = exports.getUpdatedScores(game, session);
                Object.assign(game, updatedScores.game);
                await game.save();
            }

            session.players.forEach(sessionPlayer => {
                const gameScore = session.games.reduce((total, game) => {
                    const gamePlayer = game.players.find(
                        p => p.player.toString() ===
                            sessionPlayer.player._id.toString());
                    if (!gamePlayer) {
                        console.error(
                            'Game player not found during score aggregation:',
                            sessionPlayer.player._id.toString());
                        return total;
                    }
                    return total + gamePlayer.score;
                }, 0);

                const originalStarScore = originalStarScores.find(
                    p => p.playerId ===
                        sessionPlayer.player._id.toString())?.starScore || 0;
                sessionPlayer.score = gameScore + originalStarScore;
            });

            await session.save();
            console.log('Session', session._id.toString(),
                'recalculated successfully.');
        }

        console.log('All sessions recalculated successfully.');
        return res.status(200).
            json({message: 'All session scores recalculated successfully.'});
    } catch (e) {
        console.error(e);
        return res.status(500).json({message: 'Error recalculating scores.'});
    }
};

module.exports = sessionController;

