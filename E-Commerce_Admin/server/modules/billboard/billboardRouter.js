var express = require('express');
var router = express.Router();
var tokenValidationMiddleware = require('../../middleware/tokenValidationMiddleware.js');
var admingroupValidationMiddleware = require('../../middleware/admingroupValidationMiddleware');
var billboardController = require('./billboardController');

router.use(tokenValidationMiddleware.validate);

router.get('/', billboardController.getAllBillboards);
router.use(admingroupValidationMiddleware.validate);
router.get('/active', billboardController.getActiveBillboard);
router.post('/', billboardController.addNewBillboard);
router.put('/:id', billboardController.editBillboard);
router.delete('/:id', billboardController.deleteBillboard);
router.delete('/image/:id', billboardController.deleteBillboardImage);

module.exports = router;