var express = require('express');
var router = express.Router();
var utmmediumController = require('./utmmediumController.js');
var tokenValidationMiddleware = require('../../middleware/tokenValidationMiddleware.js');
var admingroupValidationMiddleware = require('../../middleware/admingroupValidationMiddleware.js');
router.use(tokenValidationMiddleware.validate);
router.use(admingroupValidationMiddleware.validate);

router.get('/', utmmediumController.filterUtmmedia);
router.post('/', utmmediumController.addNewUtmmedium);
router.put('/:id', utmmediumController.updateUtmmedium);
router.delete('/:id', utmmediumController.deleteUtmmedium);

module.exports = router;