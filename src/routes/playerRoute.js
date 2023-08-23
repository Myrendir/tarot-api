const express = require('express');
const playerController = require('../controller/playerController');
const router = express.Router();
const auth = require('../middleware/authentication');
const isAdmin = require('../middleware/isAdmin');

router.post('/', isAdmin, playerController.create);
router.get('/:id', auth, playerController.get);
router.put('/:id', isAdmin, playerController.update);
router.delete('/:id', isAdmin, playerController.delete);

module.exports = router;