var express = require('express');
var router = express.Router();
var giftController = require('./giftController.js');
var tokenValidationMiddleware = require('../../middleware/tokenValidationMiddleware.js');
var admingroupValidationMiddleware = require('../../middleware/admingroupValidationMiddleware.js');
router.use(tokenValidationMiddleware.validate);
//router.use(admingroupValidationMiddleware.validate);

router.get('/', giftController.filterGifts);
router.post('/', giftController.addNewGift);
router.put('/:id', giftController.updateGift);
router.delete('/:id', giftController.deleteGift);

router.get('/configurator', giftController.filterGiftsConfigurator);
router.post('/configurator', giftController.addNewGiftConfigurator);
router.put('/configurator/:id', giftController.updateGiftConfigurator);
router.delete('/configurator/:id', giftController.deleteGiftConfigurator);

module.exports = router;