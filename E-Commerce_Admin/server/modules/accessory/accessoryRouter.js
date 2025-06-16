var express = require('express');
var router = express.Router();
var accessoryController = require('./accessoryController.js');
var tokenValidationMiddleware = require('../../middleware/tokenValidationMiddleware.js');
var admingroupValidationMiddleware = require('../../middleware/admingroupValidationMiddleware.js');
router.use(tokenValidationMiddleware.validate);

router.get('/', accessoryController.filterAccessories);
router.use(admingroupValidationMiddleware.validate);

router.post('/', accessoryController.addNewAccessory);
router.put('/:id', accessoryController.updateAccessory);
router.get('/:id', accessoryController.getAccessoryFullDetails);
router.delete('/:id', accessoryController.deleteAccessory);
router.delete('/images/:image_id', accessoryController.deleteAccessoryImage);

module.exports = router;