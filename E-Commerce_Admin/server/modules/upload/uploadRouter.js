var express = require('express');
var router = express.Router();
var uploadController = require('./uploadController.js');
var tokenValidationMiddleware = require('../../middleware/tokenValidationMiddleware.js');
var admingroupValidationMiddleware = require('../../middleware/admingroupValidationMiddleware.js');

// router.post('/reviews-upload', uploadController.uploadReviews)

router.use(tokenValidationMiddleware.validate);
router.use(admingroupValidationMiddleware.validate);

router.post('/', uploadController.uploadFile);

module.exports = router;