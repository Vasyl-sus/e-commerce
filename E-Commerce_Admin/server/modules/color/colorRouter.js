var express = require('express');
var router = express.Router();
var colorController = require('./colorController.js');
var tokenValidationMiddleware = require('../../middleware/tokenValidationMiddleware.js');
var admingroupValidationMiddleware = require('../../middleware/admingroupValidationMiddleware.js');
router.use(tokenValidationMiddleware.validate);
router.use(admingroupValidationMiddleware.validate);

router.get('/', colorController.getColors);
router.post('/', colorController.addColor);
router.delete('/:id', colorController.deleteColor);

module.exports = router;