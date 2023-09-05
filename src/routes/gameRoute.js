const express = require('express');
const gameController = require('../controller/gameController');
const router = express.Router();
const auth = require('../middleware/authentication');

router.post('/', gameController.create);
router.get('/:id', gameController.get);
router.get('/count', gameController.count);
router.put('/:id', gameController.update);
router.delete('/:id', gameController.delete);

module.exports = router;