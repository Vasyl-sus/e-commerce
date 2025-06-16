var express = require('express');
var router = express.Router();
var otomController = require('./otomController.js');
var tokenValidationMiddleware = require('../../middleware/tokenValidationMiddleware.js');
var admingroupValidationMiddleware = require('../../middleware/admingroupValidationMiddleware.js');
router.use(tokenValidationMiddleware.validate);

router.get('/', otomController.filterOtoms);
router.use(admingroupValidationMiddleware.validate);

router.post('/', otomController.addNewOtom);
router.put('/:id', otomController.updateOtom);
router.delete('/:id', otomController.deleteOtom);

module.exports = router;