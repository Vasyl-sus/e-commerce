var express = require('express');
var router = express.Router();
var stripeController = require('./stripeController.js');
var tokenValidationMiddleware = require('../../middleware/tokenValidationMiddleware.js');
var admingroupValidationMiddleware = require('../../middleware/admingroupValidationMiddleware.js');

router.use(tokenValidationMiddleware.validate);
router.use(admingroupValidationMiddleware.validate);

router.post('/pay-difference', stripeController.payDifference);

module.exports = router;