const express = require('express');
const router = express.Router();
const sessionController = require('../controller/sessionController');

const auth = require('../middleware/authentication');
const isAdmin = require('../middleware/isAdmin');

router.post('/', sessionController.create);
router.get('/latest', sessionController.getLatestSessions);
router.get('/:id', sessionController.get);
router.get('/count', sessionController.count);
router.put('/:id', sessionController.update);
router.delete('/:id', sessionController.delete);
router.delete('/:id/deleteLastGame',
    sessionController.deleteLastGameOfSession);
router.post('/:sessionId/addGame',
    sessionController.addGameToSessionAndUpdate);
router.post('/addStar/:sessionId/:playerId', sessionController.addStar);

module.exports = router;
