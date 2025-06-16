var express = require('express');
var router = express.Router();
var landingsController = require('./landingsController.js');
var tokenValidationMiddleware = require('../../middleware/tokenValidationMiddleware.js');
var admingroupValidationMiddleware = require('../../middleware/admingroupValidationMiddleware.js');
router.use(tokenValidationMiddleware.validate);
router.use(admingroupValidationMiddleware.validate);

router.post('/', landingsController.createLanding);

module.exports = router;