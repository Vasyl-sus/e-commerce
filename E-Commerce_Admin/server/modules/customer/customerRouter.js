var express = require('express');
var router = express.Router();
var customerController = require('./customerController.js');
var tokenValidationMiddleware = require('../../middleware/tokenValidationMiddleware.js');
var admingroupValidationMiddleware = require('../../middleware/admingroupValidationMiddleware.js');
router.use(tokenValidationMiddleware.validate);
//router.use(admingroupValidationMiddleware.validate);

router.get('/', customerController.filterCustomers);
router.get('/bd/', customerController.filterBDCustomers);
router.get('/oto/', customerController.filterOTOCustomers);
router.get('/baza1/', customerController.filterBaza1Customers);
router.get('/baza2/', customerController.filterBaza2Customers);
router.get('/baza3/', customerController.filterBaza3Customers);
router.get('/baza4/', customerController.filterBaza4Customers);
router.get('/bazap1/', customerController.getPrecomputedBaza1Customers);
router.get('/bazap2/', customerController.getPrecomputedBaza2Customers);
router.get('/bazap3/', customerController.getPrecomputedBaza3Customers);
router.get('/bazap4/', customerController.getPrecomputedBaza4Customers);
router.get('/details/:id', customerController.getCustomerDetails);
// Commented out InfoBip route as the service is disabled
// router.put('/registerinfobip/:id', customerController.subscribeCustomerToInfoBip);
router.post('/', customerController.registerNewCustomer);
router.put('/:id', customerController.updateCustomer);
router.delete('/:id', customerController.deleteCustomer);


module.exports = router;
