const express = require('express')
const router = express.Router()
const facebookController = require('./facebookController')

router.post('/page-view', facebookController.sendPageViewEvent)
router.post('/add-to-cart', facebookController.sendAddToCartEvent)
router.post('/view-content', facebookController.sendViewContentEvent)
router.post('/initial-checkout', facebookController.sendInitiateCheckoutEvent)
router.post('/purchase', facebookController.sendPurchaseEvent)
module.exports = router
