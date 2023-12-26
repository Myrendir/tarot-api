const express = require('express');
const playerController = require('../controller/playerController');
const router = express.Router();
const auth = require('../middleware/authentication');
const isAdmin = require('../middleware/isAdmin');

router.post('/', playerController.create);
router.get('/', playerController.getAll);
router.get('/:id', playerController.get);
router.put('/:id', playerController.update);
router.put('/enable/:id', playerController.setEnabled);
router.delete('/:id', playerController.delete);
router.put('/clearStars/:id', playerController.clearStars);
router.put('/removeLastStar/:id', playerController.removeLastStar);

module.exports = router;