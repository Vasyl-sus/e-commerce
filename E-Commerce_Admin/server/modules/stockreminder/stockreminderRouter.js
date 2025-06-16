var express = require('express');
var router = express.Router();
var stockreminderController = require('./stockreminderController.js');
var tokenValidationMiddleware = require('../../middleware/tokenValidationMiddleware.js');
var admingroupValidationMiddleware = require('../../middleware/admingroupValidationMiddleware.js');
router.use(tokenValidationMiddleware.validate);

router.get('/:product_id', stockreminderController.getStockreminders);

//router.use(admingroupValidationMiddleware.validate);

router.post('/', stockreminderController.addNewStockreminder);
router.put('/:id', stockreminderController.updateStockreminder);
router.delete('/:id', stockreminderController.deleteStockreminder);

module.exports = router;