const express = require('express');
const gameController = require('../controller/gameController');
const router = express.Router();
const auth = require('../middleware/authentication');

router.post('/', auth, gameController.create);
router.get('/:id', auth, gameController.get);
router.put('/:id', auth, gameController.update);
router.delete('/:id', auth, gameController.delete);

module.exports = router;