const express = require('express');
const router = express.Router();

const statisticController = require('../controller/statisticController');

router.get('/gamesTaken/:season', statisticController.getMostGamesTaken);
router.get('/calledPartners/:season',
    statisticController.getMostCalledPartners);
router.get('/chelem/:season', statisticController.getPlayersWithMostChelems);
router.get('/topWinrate/:season', statisticController.getBestWinPercentage);
router.get('/mostGamesTakenForBet/:betValue/:season',
    statisticController.getMostGamesTakenForBet);
router.get('/mostWinrateForBet/:betValue/:season',
    statisticController.getMostWinrateForBet);
router.get('/mostPointsCumulated/:season',
    statisticController.getMostPointsCumulated);
router.get('/bestAveragePointsPerGame/:season',
    statisticController.getBestAveragePointsPerGame);
router.get('/player/:id', statisticController.getPlayerStats);
router.get('/topStarred', statisticController.getTopStarred);
router.get('/getCurrentWeekScore', statisticController.getScoresForCurrentWeek);

module.exports = router;