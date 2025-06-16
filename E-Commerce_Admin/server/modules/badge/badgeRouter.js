var express = require('express');
var router = express.Router();
var badgeController = require('./badgeController.js');
var tokenValidationMiddleware = require('../../middleware/tokenValidationMiddleware.js');
var admingroupValidationMiddleware = require('../../middleware/admingroupValidationMiddleware.js');
router.use(tokenValidationMiddleware.validate);

router.get('/', badgeController.filterBadges);
//router.use(admingroupValidationMiddleware.validate);

router.post('/', badgeController.addNewBadge);
router.put('/:id', badgeController.updateBadge);
router.delete('/:id', badgeController.deleteBadge);

module.exports = router;