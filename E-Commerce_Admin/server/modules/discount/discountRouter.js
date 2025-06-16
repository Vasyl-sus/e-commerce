var express = require('express');
var router = express.Router();
var discountController = require('./discountController.js');
var tokenValidationMiddleware = require('../../middleware/tokenValidationMiddleware.js');
var admingroupValidationMiddleware = require('../../middleware/admingroupValidationMiddleware.js');
router.use(tokenValidationMiddleware.validate);

router.get('/', discountController.filterDiscounts);
router.get('/:id', discountController.getDiscountDetails);
router.post('/name/', discountController.getDiscountByName);

router.use(admingroupValidationMiddleware.validate);

router.post('/', discountController.addNewDiscount);
router.put('/:id', discountController.updateDiscount);
router.delete('/:id', discountController.deleteDiscount1);

module.exports = router;