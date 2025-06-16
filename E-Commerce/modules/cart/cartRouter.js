var express = require('express');
var router = express.Router();
var cartController = require('./cartController.js');

router.post('/', cartController.addToCart);
router.put('/', cartController.changeQuantity);
router.get('/discount/:discountId', cartController.getDiscountData);
router.post('/discount', cartController.addDiscountToCart);
router.delete('/discount', cartController.removeDiscount);
router.post('/gift', cartController.addGiftToCart);
router.get('/', cartController.getCart);
router.get('/clear', cartController.clearCart);
router.put('/:therapy_id', cartController.editQuantity);
router.delete('/gift/:therapy_id', cartController.removeGiftFromCart);
router.delete('/:therapy_id', cartController.removeFromCart);
router.post('/delivery', cartController.addDeliverymethodToCart);
router.post('/payment', cartController.addPaymentmethodToCart);
router.post('/paymentdelivery', cartController.addDeliverymethodPaymentToCart)
router.get('/therapies/status', cartController.getTherapyStatuses);
router.get('/accessories/status', cartController.getAccessoryStatuses);

module.exports = router;
