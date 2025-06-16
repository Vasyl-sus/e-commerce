var express = require('express');
var router = express.Router();
var mailingService = require('../../utils/mailchimpService');
var tokenValidationMiddleware = require('../../middleware/tokenValidationMiddleware.js');
var mailController = require('./mailController')

router.use(tokenValidationMiddleware.validate);

router.post('/', mailController.sendMail);

module.exports = router;