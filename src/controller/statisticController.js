const {Game} = require('../model/game');
const Player = require('../model/player');
const {Session, getFinalDate, getFirstDate} = require('../model/session');
const mongoose = require('mongoose');
const statisticController = {};

statisticController.getMostGamesTaken = async (req, res) => {
    try {
        const season = req.params.season;
        const event = req.query.event;

        let pipeline = [
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

        ];

        if (season !== 'none') {
            pipeline.unshift({
                $match: {
                    season: season,
                },
            });
            if (event === 'final') {
                let startDate = getFinalDate(season)[1];
                startDate = new Date(startDate.getFullYear(),
                    startDate.getMonth(),
                    startDate.getDate(), 18, 0, 0, 0);
                let endDate = getFinalDate(season)[1];
                endDate = new Date(endDate.getFullYear(), endDate.getMonth(),
                    endDate.getDate(), 23, 59, 59, 999);

                pipeline.unshift({
                    $match: {
                        season: season,
                        createdAt: {
                            $gte: startDate,
                            $lte: endDate,
                        },
                    },
                });
            }
        }
        const topTakers = await Game.aggregate(pipeline);

        res.json(topTakers);
    } catch (err) {
        res.status(500).json({error: 'Failed to fetch top takers.'});
    }
};

statisticController.getMostCalledPartners = async (req, res) => {
    try {
        const season = req.params.season;
        const event = req.query.event;

        let pipeline = [
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
        ];

        if (season !== 'none') {
            pipeline.unshift({
                $match: {
                    season: season,
                },
            });
            if (event === 'final') {
                let startDate = getFinalDate(season)[1];
                startDate = new Date(startDate.getFullYear(),
                    startDate.getMonth(),
                    startDate.getDate(), 18, 0, 0, 0);
                let endDate = getFinalDate(season)[1];
                endDate = new Date(endDate.getFullYear(), endDate.getMonth(),
                    endDate.getDate(), 23, 59, 59, 999);

                pipeline.unshift({
                    $match: {
                        season: season,
                        createdAt: {
                            $gte: startDate,
                            $lte: endDate,
                        },
                    },
                });
            }
        }
        const topCalledPartners = await Game.aggregate(pipeline);

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
        const season = req.params.season;
        const event = req.query.event;

        let pipeline = [
            {
                $group: {
                    _id: '$taker',
                    totalGames: {$sum: 1},
                    wonGames: {$sum: {$cond: [{$eq: ['$won', true]}, 1, 0]}},
                },
            },
            {
                $match: {totalGames: {$gte: 3}},
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
                $sort: {
                    winPercentage: -1,
                    totalGames: -1,
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
        ];

        if (season !== 'none') {
            pipeline.unshift({
                $match: {
                    season: season,
                },
            });
            if (event === 'final') {
                let startDate = getFinalDate(season)[1];
                startDate = new Date(startDate.getFullYear(),
                    startDate.getMonth(),
                    startDate.getDate(), 18, 0, 0, 0);
                let endDate = getFinalDate(season)[1];
                endDate = new Date(endDate.getFullYear(), endDate.getMonth(),
                    endDate.getDate(), 23, 59, 59, 999);

                pipeline.unshift({
                    $match: {
                        season: season,
                        createdAt: {
                            $gte: startDate,
                            $lte: endDate,
                        },
                    },
                });
            }
        }

        const bestWinPercentagePlayers = await Game.aggregate(pipeline);

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
        const season = req.params.season;
        const winrateForBet = await Game.aggregate([
            {
                $match: {
                    bet: betValue,
                    season: season,
                },
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
        const season = req.params.season;
        const event = req.query.event;

        const buildBaseMatch = (season, event) => {
            let match = {season: season};

            let startDate = getFinalDate(season)[0];
            let endDate = getFinalDate(season)[1];
            if (event === 'final') {
                startDate = new Date(endDate.getFullYear(),
                    endDate.getMonth(),
                    endDate.getDate(), 18, 0, 0, 0);
                endDate = new Date(endDate.getFullYear(), endDate.getMonth(),
                    endDate.getDate(), 23, 59, 59, 999);
            }

            match.createdAt = {
                $gte: startDate,
                $lte: endDate,
            };
            return match;
        };

        let pipelinePoints = [
            {
                $unwind: '$players',
            },
            {
                $group: {
                    _id: '$players.player',
                    totalPoints: {$sum: '$players.score'},
                },
            },
        ];

        let pipelineGames = [
            {
                $unwind: '$players',
            },
            {
                $group: {
                    _id: '$players.player',
                    gameCount: {$sum: 1},
                },
            },
        ];

        if (season !== 'none') {
            pipelineGames.unshift({
                $match: buildBaseMatch(season, event),
            });

            pipelinePoints.unshift({
                $match: buildBaseMatch(season, event),
            });
        }
        const [topPlayersByPoints, gameCounts] = await Promise.all([
            Session.aggregate(pipelinePoints),
            Game.aggregate(pipelineGames),
        ]);

        let playersDetails = await Player.find({
            _id: {$in: topPlayersByPoints.map(p => p._id)},
        });

        const mergedResults = topPlayersByPoints.map(player => {
            const gameCount = gameCounts.find(
                game => game._id.equals(player._id))?.gameCount || 0;
            const playerDetails = playersDetails.find(
                p => p._id.equals(player._id));
            return {
                ...player,
                gameCount,
                firstname: playerDetails?.firstname,
                lastname: playerDetails?.lastname,
            };
        });

        mergedResults.sort((a, b) => b.totalPoints - a.totalPoints ||
            a.firstname.localeCompare(b.firstname));

        res.json(mergedResults);
    } catch (err) {
        res.status(500).
            json({error: 'Failed to fetch top players by points and games.'});
    }
};

statisticController.getBestAveragePointsPerGame = async (req, res) => {
    try {
        const season = req.params.season;
        const topPlayersByAvgPoints = await Game.aggregate([
            {
                $match: {
                    season: season,
                },
            },
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

        const player = await Player.findById(playerId);
        const countStars = player.stars.length;
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
        const takerGames = await Game.find({
            taker: playerId,
        }).countDocuments();

        const bets = betStats.map((bet) => {
            return {
                bet: bet._id,
                count: bet.count,
                percentage: (bet.count / takerGames * 100).toFixed(2),
            };
        });

        bets.sort((a, b) => b.count - a.count);

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
            stars: countStars,
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

statisticController.getTopStarred = async (req, res) => {
    try {
        const season = req.params.season;
        const event = req.query.event;
        let startDate, endDate;

        if (season !== 'none') {
            [startDate, endDate] = getFinalDate(season);

            if (event === 'final') {
                endDate = new Date(endDate.getFullYear(), endDate.getMonth(),
                    endDate.getDate(), 23, 59, 59, 999);
                startDate = new Date(endDate.getFullYear(), endDate.getMonth(),
                    endDate.getDate(), 18, 0, 0, 0);
            }
        }

        const pipeline = [
            {
                $match: {
                    active: true,
                },
            },
            {
                $project: {
                    firstname: 1,
                    lastname: 1,
                    stars: {
                        $ifNull: ['$stars', []],
                    },
                },
            },
            {
                $project: {
                    firstname: 1,
                    lastname: 1,
                    stars: 1,
                    starsCount: season !== 'none' ? {
                        $size: {
                            $filter: {
                                input: '$stars',
                                as: 'star',
                                cond: season !== 'none' ? {
                                    $and: [
                                        {$gte: ['$$star.date', startDate]},
                                        {$lte: ['$$star.date', endDate]},
                                    ],
                                } : {},
                            },
                        },
                    } : {$size: '$stars'},
                },
            },
            {
                $match: {
                    starsCount: {$gt: 0},
                },
            },
            {
                $sort: {
                    starsCount: -1,
                    firstname: 1,
                },
            },
            {
                $project: {
                    firstname: 1,
                    lastname: 1,
                    starsCount: 1,
                },
            },
        ];

        const playersWithStarsCount = await Player.aggregate(pipeline);

        res.status(200).json(playersWithStarsCount);
    } catch (err) {
        res.status(500).json({
            error: 'Échec de la récupération plus étoilés.',
            message: err.message,
        });
    }
};
/**
 * Get top 10 players with most stars
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
statisticController.getScoresForCurrentWeek = async (req, res) => {
    try {
        const currentDate = new Date();
        const currentDayOfWeek = currentDate.getDay();
        const startDate = new Date(currentDate);
        const endDate = new Date(currentDate);

        const daysUntilMonday = (currentDayOfWeek === 0 ? -6 : 1) - currentDayOfWeek;
        const daysUntilSunday = 7 - currentDayOfWeek;

        startDate.setDate(startDate.getDate() + daysUntilMonday);
        startDate.setHours(0, 0, 0, 0);
        endDate.setDate(endDate.getDate() + daysUntilSunday);
        endDate.setHours(23, 59, 59, 999);

        let totalPointsBeforeWeekStart = await Game.aggregate([
            {
                $match: {
                    createdAt: {
                        $lt: startDate,
                    },
                },
            },
            {
                $unwind: '$players',
            },
            {
                $group: {
                    _id: '$players.player',
                    totalPoints: {$sum: '$players.score'},
                },
            },
        ]).then(results =>
            results.reduce((acc, curr) => {
                acc[curr._id] = curr.totalPoints;
                return acc;
            }, {})
        );

        const scoresForCurrentWeek = await Game.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: startDate,
                        $lte: endDate,
                    },
                },
            },
            {
                $unwind: '$players',
            },
            {
                $group: {
                    _id: '$players.player',
                    dailyPoints: {
                        $push: {
                            day: {$dayOfWeek: '$createdAt'},
                            points: '$players.score',
                        },
                    },
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
                    _id: 0,
                    player: '$_id',
                    firstname: '$playerDetails.firstname',
                    lastname: '$playerDetails.lastname',
                    dailyPoints: 1,
                    totalPointsBeforeWeekStart: {
                        $ifNull: [{$literal: totalPointsBeforeWeekStart['$_id']}, 0],
                    },
                },
            },
            {
                $addFields: {
                    totalPointsBeforeWeekStart: {
                        $ifNull: [totalPointsBeforeWeekStart['$player'], 0],
                    },
                },
            },
        ]);

        res.json(scoresForCurrentWeek);
    } catch (err) {
        res.status(500).json({error: 'Failed to fetch scores for the current week.'});
    }
};

module.exports = statisticController;