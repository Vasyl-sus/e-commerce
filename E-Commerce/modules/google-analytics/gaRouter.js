const express = require('express')
const router = express.Router()
const gaController = require('./gaController')

// Define routes for different GA4 events
router.post('/page-view', gaController.sendPageViewEvent)
router.post('/add-to-cart', gaController.sendAddToCartEvent)
router.post('/view-item', gaController.sendViewItemEvent)
router.post('/view-item-list', gaController.sendViewItemListEvent)
router.post('/begin-checkout', gaController.sendBeginCheckoutEvent)
router.post('/purchase', gaController.sendPurchaseEvent)

module.exports = router
