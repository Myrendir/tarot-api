const express = require('express');
const playerController = require('../controller/playerController');
const router = express.Router();
const auth = require('../middleware/authentication');
const isAdmin = require('../middleware/isAdmin');

router.post('/', playerController.create);
router.get('/', playerController.getAll);
router.get('/:id', playerController.get);
router.put('/:id', playerController.update);
router.delete('/:id', playerController.delete);

module.exports = router;