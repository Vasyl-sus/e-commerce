var express = require('express');
var router = express.Router();
var pharmacyController = require('./pharmacyController.js');
var tokenValidationMiddleware = require('../../middleware/tokenValidationMiddleware.js');
var admingroupValidationMiddleware = require('../../middleware/admingroupValidationMiddleware.js');
router.use(tokenValidationMiddleware.validate);
router.use(admingroupValidationMiddleware.validate);

router.get('/', pharmacyController.filterPharmacies);
router.post('/', pharmacyController.addNewPharmacy);
router.put('/:id', pharmacyController.updatePharmacy);
router.delete('/:id', pharmacyController.deletePharmacy);
router.delete('/image/:id', pharmacyController.deletePharmacyImage);

module.exports = router;