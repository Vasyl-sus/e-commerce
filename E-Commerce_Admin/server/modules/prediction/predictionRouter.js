var express = require('express');
var router = express.Router();
var predictionController = require('./predictionController.js');
//var tokenValidationMiddleware = require('../../middleware/tokenValidationMiddleware.js');
//var admingroupValidationMiddleware = require('../../middleware/admingroupValidationMiddleware.js');
// router.post('/import/mongo/customers', predictionController.importCustomersMongo); 
// router.post('/import/mongo/orders', predictionController.importOrdersMongo); 
//router.use(tokenValidationMiddleware.validate);
//router.use(admingroupValidationMiddleware.validate);

// router.get('/', predictionController.getPythonCustomerData);
// router.get('/prepare/', predictionController.prepareCSV); 
// router.get('/modify/', predictionController.modifyPythonData1); 
// router.post('/upload/', predictionController.uploadFiles);

module.exports = router;