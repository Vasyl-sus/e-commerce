var express = require('express');
var router = express.Router();
var orderController = require('./orderController.js');
var tokenValidationMiddleware = require('../../middleware/tokenValidationMiddleware.js');

router.post('/', orderController.createOrderOneStep);
router.get('/:id', orderController.getOrderDetails);
router.post('/apiorder', orderController.createOrderApi);
router.post('/apidiscount', orderController.checkDiscountApi);
router.post('/apiorderwp', orderController.createOrderApiWp);
router.post('/initial', orderController.createInitialOrder);
router.post('/update-initial', orderController.updateInitialOrder);

router.use(tokenValidationMiddleware.validate);
router.post('/status/', orderController.changeStatus);

module.exports = router;
