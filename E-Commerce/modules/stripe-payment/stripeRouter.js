const express = require('express')
const router = express.Router()
const stripeController = require('./stripeController')
const { checkCustomer } = require('./checkCustomer.middleware')

router.use(checkCustomer)
router.post('/update', stripeController.updateOrder)
router.post('/intent', stripeController.createIntent)
router.post('/charge-intent', stripeController.stripeChargeIntent)
router.post('/intent-upsell', stripeController.createUpsellIntent)
router.post('/create-payment', stripeController.createDBPayment)
router.post('/create-session', stripeController.createCustomerSession)
router.post('/setup-intent', stripeController.setupPaymentIntent)
router.post('/save-payment-method', stripeController.savePaymentMethod)
router.post('/attach-payment-method', stripeController.savePaymentMethod)
module.exports = router
