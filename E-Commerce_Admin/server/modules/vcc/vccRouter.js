var express = require('express');
var router = express.Router();
var vccController = require('./vccController.js');
var tokenValidationMiddleware = require('../../middleware/tokenValidationMiddleware.js');
var admingroupValidationMiddleware = require('../../middleware/admingroupValidationMiddleware.js');
//router.use(admingroupValidationMiddleware.validate);

//router.post('/wh/', vccController.getWebhook); - vitanoval
router.post('/wh2/', vccController.getWebhook2);

router.use(tokenValidationMiddleware.validate);

router.get('/call/:number', vccController.callNumber);
router.get('/call/order/:order_id', vccController.callOrder);
router.get('/call/hold/', vccController.callHold);
router.get('/call/hangup/', vccController.callHangUp);
router.get('/report/:id', vccController.getAgentReport);
router.get('/project/:vcc_username', vccController.getLastProjectLogin);

module.exports = router;