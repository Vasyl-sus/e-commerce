var express = require('express');
var router = express.Router();
var paymentController = require('./paymentController.js');
var tokenValidationMiddleware = require('../../middleware/tokenValidationMiddleware.js');
// var admingroupValidationMiddleware = require('../../middleware/admingroupValidationMiddleware.js');
router.use(tokenValidationMiddleware.validate);
// router.use(admingroupValidationMiddleware.validate);

router.get('/:id', paymentController.getPayment);

module.exports = router;