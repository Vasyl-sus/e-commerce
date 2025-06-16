var express = require('express');
var router = express.Router();
var currencyController = require('./currencyController.js');
var tokenValidationMiddleware = require('../../middleware/tokenValidationMiddleware.js');
var admingroupValidationMiddleware = require('../../middleware/admingroupValidationMiddleware.js');
router.use(tokenValidationMiddleware.validate);

router.get('/', currencyController.filterCurrencies);
router.use(admingroupValidationMiddleware.validate);
router.post('/', currencyController.addNewCurrency);
router.put('/:id', currencyController.updateCurrency);
router.delete('/:id', currencyController.deleteCurrency);

module.exports = router;