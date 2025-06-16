var express = require('express');
var router = express.Router();
var infoBipController = require('./infoBipController.js');
var tokenValidationMiddleware = require('../../middleware/tokenValidationMiddleware.js');
var admingroupValidationMiddleware = require('../../middleware/admingroupValidationMiddleware.js');
// router.use(tokenValidationMiddleware.validate);

//router.use(admingroupValidationMiddleware.validate);

router.post('/message', infoBipController.sendMessage);
router.post('/omniscenario', infoBipController.createOmniScenario);
router.post('/omnimessage', infoBipController.sendOmniMessage);
router.post('/omnisimplemessage', infoBipController.sendSimpleOmniMessage);
router.get('/omnireport', infoBipController.checkOmniReports);

router.get('/scenarios', infoBipController.getInfoBipScenarios);
router.delete('/scenarios/:id', infoBipController.deleteInfoBipScenario);

router.get('/customers', infoBipController.getInfoBipCustomers);

router.get('/omnimessages', infoBipController.getInfoBipMessages);

module.exports = router;