var express = require('express');
var router = express.Router();
var subscriberController = require('./subscriberController.js');
var cronController = require('../cronActions/cronController.js');
//var tokenValidationMiddleware = require('../../middleware/tokenValidationMiddleware.js');
//router.use(tokenValidationMiddleware.validate);

router.post('/', subscriberController.createSubscription);
router.post('/verifyReCaptchaToken/', subscriberController.verifyReCaptchaToken)
router.post('/wh/', subscriberController.getWebhook);
router.post('/wh-sendgrid/', subscriberController.getSendgridWebhook);
router.post('/ask-us/', subscriberController.askUsMail);
router.get('/cron_otom/', cronController.sendOtoms);
router.post('/unsubscribeInfoBip/', subscriberController.unsubscribeInfoBip);


module.exports = router;