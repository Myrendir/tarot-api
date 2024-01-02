const express = require('express');
const gameController = require('../controller/gameController');
const router = express.Router();
const auth = require('../middleware/authentication');

router.get('/latest', gameController.getLatestGame);
router.post('/', gameController.create);
router.get('/:id', gameController.get);
router.get('/count', gameController.count);
router.put('/:id', gameController.update);
router.delete('/:id', gameController.delete);
router.get('/nonZeroScore', gameController.getGamesWithNonZeroScores);

module.exports = router;