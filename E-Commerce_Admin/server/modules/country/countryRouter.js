var express = require('express');
var router = express.Router();
var countryController = require('./countryController.js');
var tokenValidationMiddleware = require('../../middleware/tokenValidationMiddleware.js');
var admingroupValidationMiddleware = require('../../middleware/admingroupValidationMiddleware.js');
router.use(tokenValidationMiddleware.validate);

router.get('/', countryController.filterCountries);
router.use(admingroupValidationMiddleware.validate);

router.post('/', countryController.addCountry);
router.put('/:id', countryController.updateCountry);
router.delete('/:id', countryController.deleteCountry);

module.exports = router;