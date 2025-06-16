var express = require('express');
var router = express.Router();
var paymentmethodController = require('./paymentmethodController.js');
var tokenValidationMiddleware = require('../../middleware/tokenValidationMiddleware.js');
var admingroupValidationMiddleware = require('../../middleware/admingroupValidationMiddleware.js');
router.use(tokenValidationMiddleware.validate);
router.use(admingroupValidationMiddleware.validate);

router.get('/', paymentmethodController.filterPaymentmethods);
router.post('/', paymentmethodController.addNewPaymentmethod);
router.put('/:id', paymentmethodController.updatePaymentmethod);
router.delete('/:id', paymentmethodController.deletePaymentmethod);
router.delete('/image/:id', paymentmethodController.deletePaymentmetodImage);

module.exports = router;