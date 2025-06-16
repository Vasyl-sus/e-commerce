var express = require('express');
var router = express.Router();
var mediumController = require('./mediumController.js');
var tokenValidationMiddleware = require('../../middleware/tokenValidationMiddleware.js');
var admingroupValidationMiddleware = require('../../middleware/admingroupValidationMiddleware.js');
router.use(tokenValidationMiddleware.validate);
router.use(admingroupValidationMiddleware.validate);

router.get('/', mediumController.filterMediums);
router.post('/', mediumController.addNewMedium);
router.put('/:id', mediumController.updateMedium);
router.delete('/:id', mediumController.deleteMedium);
router.delete('/images/:image_id', mediumController.deleteMediumImage);

module.exports = router;