const {Game} = require('../model/game');
const Player = require('../model/player');
const Session = require('../model/session');
const mongoose = require('mongoose');
const statisticController = {};

statisticController.getMostGamesTaken = async (req, res) => {
    try {
        const topTakers = await Game.aggregate([
            {
                $group: {
                    _id: '$taker',
                    count: {$sum: 1},
                },
            },
            {
                $lookup: {
                    from: Player.collection.name,
                    localField: '_id',
                    foreignField: '_id',
                    as: 'playerDetails',
                },
            },
            {
                $unwind: '$playerDetails',
            },
            {
                $project: {
                    firstname: '$playerDetails.firstname',
                    lastname: '$playerDetails.lastname',
                    count: 1,
                },
            },
            {
                $sort: {
                    count: -1,
                    firstname: 1,
                },
            },
            {
                $limit: 10,
            },
        ]);

        res.json(topTakers);
    } catch (err) {
        res.status(500).json({error: 'Failed to fetch top takers.'});
    }
};

statisticController.getMostCalledPartners = async (req, res) => {
    try {
        const topCalledPartners = await Game.aggregate([
            {
                $match: {partner: {$ne: null}},
            },
            {
                $group: {
                    _id: '$partner',
                    count: {$sum: 1},
                },
            },
            {
                $lookup: {
                    from: Player.collection.name,
                    localField: '_id',
                    foreignField: '_id',
                    as: 'playerDetails',
                },
            },
            {
                $unwind: '$playerDetails',
            },
            {
                $project: {
                    firstname: '$playerDetails.firstname',
                    lastname: '$playerDetails.lastname',
                    count: 1,
                },
            },
            {
                $sort: {
                    count: -1,
                    firstname: 1,
                },
            },
        ]);

        res.json(topCalledPartners);
    } catch (err) {
        res.status(500).json({error: err});
    }
};

statisticController.getPlayersWithMostChelems = async (req, res) => {
    try {
        const topChelemPlayers = await Game.aggregate([
            {
                $match: {chelemWon: true},
            },
            {
                $group: {
                    _id: '$taker',
                    count: {$sum: 1},
                },
            },
            {
                $sort: {count: -1, firstname: 1},
            },
            {
                $limit: 10,
            },
            {
                $lookup: {
                    from: Player.collection.name,
                    localField: '_id',
                    foreignField: '_id',
                    as: 'playerDetails',
                },
            },
            {
                $unwind: '$playerDetails',
            },
            {
                $project: {
                    player: '$playerDetails.username',
                    count: 1,
                },
            },
        ]);

        res.json(topChelemPlayers);
    } catch (err) {
        res.status(500).
            json({error: 'Failed to fetch players with most chelems.'});
    }
};

statisticController.getBestWinPercentage = async (req, res) => {
    try {
        const bestWinPercentagePlayers = await Game.aggregate([
            {
                $group: {
                    _id: '$taker',
                    totalGames: {$sum: 1},
                    wonGames: {$sum: {$cond: [{$eq: ['$won', true]}, 1, 0]}},
                },
            },
            {
                $project: {
                    winPercentage: {
                        $multiply: [
                            {
                                $divide: [
                                    '$wonGames',
                                    '$totalGames'],
                            }, 100],
                    },
                    totalGames: 1,
                    wonGames: 1,
                },
            },

            {
                $limit: 10,
            },
            {
                $lookup: {
                    from: Player.collection.name,
                    localField: '_id',
                    foreignField: '_id',
                    as: 'playerDetails',
                },
            },
            {
                $unwind: '$playerDetails',
            },
            {
                $project: {
                    firstname: '$playerDetails.firstname',
                    lastname: '$playerDetails.lastname',
                    winPercentage: 1,
                    totalGames: 1,
                    wonGames: 1,
                },
            },
            {
                $sort: {
                    winPercentage: -1,
                    totalGames: -1,
                    firstname: 1,
                },
            },
        ]);

        res.json(bestWinPercentagePlayers);
    } catch (err) {
        res.status(500).
            json({error: 'Failed to fetch players with best win percentage.'});
    }
};

statisticController.getMostGamesTakenForBet = async (req, res) => {
    try {
        const betValue = req.params.betValue;

        const topTakersForBet = await Game.aggregate([
            {
                $match: {bet: betValue},
            },
            {
                $group: {
                    _id: '$taker',
                    count: {$sum: 1},
                },
            },
            {
                $sort: {count: -1},
            },
            {
                $lookup: {
                    from: Player.collection.name,
                    localField: '_id',
                    foreignField: '_id',
                    as: 'playerDetails',
                },
            },
            {
                $unwind: '$playerDetails',
            },
            {
                $project: {
                    player: '$playerDetails.username',
                    count: 1,
                },
            },
        ]);

        res.json(topTakersForBet);
    } catch (err) {
        res.status(500).json(
            {error: `Failed to fetch top takers for bet ${req.params.betValue}.`});
    }
};

statisticController.getMostWinrateForBet = async (req, res) => {
    try {
        const betValue = req.params.betValue;

        const winrateForBet = await Game.aggregate([
            {
                $match: {bet: betValue},
            },
            {
                $group: {
                    _id: '$taker',
                    totalGames: {$sum: 1},
                    totalWins: {
                        $sum: {
                            $cond: [{$eq: ['$won', true]}, 1, 0],
                        },
                    },
                },
            },
            {
                $match: {totalGames: {$gte: 5}},
            },
            {
                $project: {
                    winrate: {
                        $multiply: [
                            {
                                $cond: [
                                    {$eq: ['$totalGames', 0]},
                                    0,
                                    {$divide: ['$totalWins', '$totalGames']},
                                ],
                            },
                            100,
                        ],
                    },
                    totalGames: 1,
                },
            },
            {
                $lookup: {
                    from: Player.collection.name,
                    localField: '_id',
                    foreignField: '_id',
                    as: 'playerDetails',
                },
            },
            {
                $unwind: '$playerDetails',
            },
            {
                $project: {
                    firstname: '$playerDetails.firstname',
                    lastname: '$playerDetails.lastname',
                    winrate: 1,
                    totalGames: 1,
                },
            },
            {
                $sort: {
                    winrate: -1,
                    totalGames: -1,
                    firstname: 1,
                },
            },
        ]);

        res.json(winrateForBet);
    } catch (err) {
        res.status(500).json(
            {error: `Failed to fetch winrate for bet ${req.params.betValue}.`});
    }
};

statisticController.getMostPointsCumulated = async (req, res) => {
    try {
        const topPlayersByPoints = await Game.aggregate([
            {
                $unwind: '$players',
            },
            {
                $group: {
                    _id: '$players.player',
                    totalPoints: {$sum: '$players.score'},
                },
            },
            {
                $lookup: {
                    from: Player.collection.name,
                    localField: '_id',
                    foreignField: '_id',
                    as: 'playerDetails',
                },
            },
            {
                $unwind: '$playerDetails',
            },
            {
                $project: {
                    firstname: '$playerDetails.firstname',
                    lastname: '$playerDetails.lastname',
                    totalPoints: 1,
                },
            },
            {
                $sort: {
                    totalPoints: -1,
                },
            },
        ]);

        res.json(topPlayersByPoints);
    } catch (err) {
        res.status(500).json({error: 'Failed to fetch top players by points.'});
    }
};

statisticController.getBestAveragePointsPerGame = async (req, res) => {
    try {
        const topPlayersByAvgPoints = await Game.aggregate([
            {
                $unwind: '$players',
            },
            {
                $group: {
                    _id: '$players.player',
                    totalPoints: {$sum: '$players.score'},
                    totalGames: {$sum: 1},
                },
            },
            {
                $match: {totalGames: {$gte: 10}},
            },
            {
                $project: {
                    averagePoints: {$divide: ['$totalPoints', '$totalGames']},
                    totalGames: 1,
                },
            },
            {
                $lookup: {
                    from: Player.collection.name,
                    localField: '_id',
                    foreignField: '_id',
                    as: 'playerDetails',
                },
            },
            {
                $unwind: '$playerDetails',
            },
            {
                $project: {
                    firstname: '$playerDetails.firstname',
                    lastname: '$playerDetails.lastname',
                    averagePoints: 1,
                    totalGames: 1,
                },
            },
            {
                $sort: {averagePoints: -1, totalGames: -1, firstname: 1},
            },
            {
                $limit: 10,
            },
        ]);

        res.json(topPlayersByAvgPoints);
    } catch (err) {
        res.status(500).json(
            {error: 'Failed to fetch players by average points per game.'});
    }
};

statisticController.getPlayerStats = async (req, res) => {
    const playerId = req.params.id;

    try {
        const totalGames = await Game.find({
            'players.player': playerId,
        }).countDocuments();

        const wonGames = await Game.find({
            'players.player': playerId,
            won: true,
        }).countDocuments();

        const winRate = (wonGames / totalGames * 100).toFixed(2);

        const betStats = await Game.aggregate([
            {
                $match: {
                    $or: [
                        {taker: new mongoose.Types.ObjectId(playerId)},
                        {caller: new mongoose.Types.ObjectId(playerId)},
                    ],
                    'players.player': new mongoose.Types.ObjectId(playerId),
                },
            },
            {
                $group: {
                    _id: '$bet',
                    count: {$sum: 1},
                },
            },
        ]);
        const bets = betStats.map((bet) => {
            return {
                bet: bet._id,
                count: bet.count,
                percentage: (bet.count / totalGames * 100).toFixed(2),
            };
        });

        bets.sort((a, b) => b.count - a.count);

        const takerGames = await Game.find({
            taker: playerId,
        }).countDocuments();
        const takerRate = (takerGames / totalGames * 100).toFixed(2);

        const partnerGames = await Game.find({
            partner: playerId,
        }).countDocuments();
        const partnerRate = (partnerGames / totalGames * 100).toFixed(2);

        const totalSessions = await Session.find({
            'players.player': playerId,
        }).countDocuments();
        const pointsStats = await Game.aggregate([
            {
                $match: {
                    'players.player': new mongoose.Types.ObjectId(playerId),
                },
            },
            {
                $project: {
                    score: {
                        $first: {
                            $filter: {
                                input: '$players',
                                as: 'player',
                                cond: {
                                    $eq: [
                                        '$$player.player',
                                        new mongoose.Types.ObjectId(playerId)],
                                },
                            },
                        },
                    },
                },
            },
            {
                $group: {
                    _id: null,
                    totalPoints: {$sum: '$score.score'},
                    totalGames: {$sum: 1},
                },
            },
            {
                $project: {
                    totalPoints: 1,
                    averagePointsPerGame: {
                        $divide: [
                            '$totalPoints',
                            '$totalGames'],
                    },
                },
            },
        ]);

        const totalPoints = pointsStats[0].totalPoints;
        const averagePointsPerGame = pointsStats[0].averagePointsPerGame.toFixed(
            2);

        const stats = {
            winRate: winRate,
            bets: bets,
            takerRate: takerRate,
            partnerRate: partnerRate,
            totalGames: totalGames,
            totalSessions: totalSessions,
            totalPoints: totalPoints,
            averagePointsPerGame: averagePointsPerGame,
        };

        res.json(stats);

    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Failed to fetch player stats.'});
    }
};

module.exports = statisticController;