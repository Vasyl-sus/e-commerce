var express = require('express');
var router = express.Router();
var deliverymethodController = require('./deliverymethodController.js');
var tokenValidationMiddleware = require('../../middleware/tokenValidationMiddleware.js');
var admingroupValidationMiddleware = require('../../middleware/admingroupValidationMiddleware.js');
router.use(tokenValidationMiddleware.validate);
router.use(admingroupValidationMiddleware.validate);

router.get('/', deliverymethodController.filterDeliverymethods);
router.post('/', deliverymethodController.addNewDeliverymethod);
router.put('/:id', deliverymethodController.updateDeliverymethod);
router.delete('/:id', deliverymethodController.deleteDeliverymethod);

module.exports = router;