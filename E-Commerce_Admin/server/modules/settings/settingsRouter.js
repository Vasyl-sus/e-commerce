var express = require('express');
var router = express.Router();
var settingsController = require('./settingsController.js');
var tokenValidationMiddleware = require('../../middleware/tokenValidationMiddleware.js');
var admingroupValidationMiddleware = require('../../middleware/admingroupValidationMiddleware.js');
router.use(tokenValidationMiddleware.validate);
router.use(admingroupValidationMiddleware.validate);

router.get('/', settingsController.getSettings);
router.post('/', settingsController.editSettings);

module.exports = router;