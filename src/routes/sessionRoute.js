const express = require('express');
const router = express.Router();
const sessionController = require('../controller/sessionController');

const auth = require('../middleware/authentication');
const isAdmin = require('../middleware/isAdmin');

router.post('/', sessionController.create);
router.get('/check', sessionController.checkExistingSession);
router.get('/:id', sessionController.get);
router.get('/count', sessionController.count);
router.put('/:id', sessionController.update);
router.delete('/:id', sessionController.delete);
router.delete('/:id/deleteLastGame',
    sessionController.deleteLastGameOfSession);
router.post('/:sessionId/addGame',
    sessionController.addGameToSessionAndUpdate);

module.exports = router;