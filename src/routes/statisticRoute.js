const express = require('express');
const router = express.Router();

const statisticController = require('../controller/statisticController');

router.get('/gamesTaken', statisticController.getMostGamesTaken);
router.get('/calledPartners', statisticController.getMostCalledPartners);
router.get('/chelem', statisticController.getPlayersWithMostChelems);
router.get('/topWinrate', statisticController.getBestWinPercentage);
router.get('/mostGamesTakenForBet/:betValue',
    statisticController.getMostGamesTakenForBet);
router.get('/mostWinrateForBet/:betValue',
    statisticController.getMostWinrateForBet);
router.get('/mostPointsCumulated',
    statisticController.getMostPointsCumulated);
router.get('/bestAveragePointsPerGame',
    statisticController.getBestAveragePointsPerGame);

router.get('/player/:id', statisticController.getPlayerStats);

module.exports = router;