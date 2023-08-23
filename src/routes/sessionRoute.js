const express = require('express');
const router = express.Router();
const sessionController = require('../controller/sessionController');

const auth = require('../middleware/authentication');
const isAdmin = require('../middleware/isAdmin');

router.post('/', auth, sessionController.create);

router.get('/:id', auth, sessionController.get);

router.put('/:id', auth, sessionController.update);

router.delete('/:id', isAdmin, sessionController.delete);

router.post('/:sessionId/addGame/:gameId', auth,
    sessionController.addGameToSession);

module.exports = router;
