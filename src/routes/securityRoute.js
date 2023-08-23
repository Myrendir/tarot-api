const express = require('express');
const router = express.Router();
const securityController = require('../controller/securityController');

router.post('/login', securityController.login);

module.exports = router;
