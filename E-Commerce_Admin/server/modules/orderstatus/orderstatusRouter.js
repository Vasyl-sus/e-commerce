var express = require('express');
var router = express.Router();
var orderstatusController = require('./orderstatusController.js');
var tokenValidationMiddleware = require('../../middleware/tokenValidationMiddleware.js');
var admingroupValidationMiddleware = require('../../middleware/admingroupValidationMiddleware.js');
router.use(tokenValidationMiddleware.validate);
router.use(admingroupValidationMiddleware.validate);

router.get('/', orderstatusController.filterOrderstatuses);
router.post('/', orderstatusController.addNewOrderstatus);
router.put('/:id', orderstatusController.updateOrderstatus);
router.delete('/:id', orderstatusController.deleteOrderstatus);

module.exports = router;