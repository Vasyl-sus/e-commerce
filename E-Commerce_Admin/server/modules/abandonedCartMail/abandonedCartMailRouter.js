var express = require('express');
var router = express.Router();
var acMailController = require('./abandonedCartMailController');
var tokenValidationMiddleware = require('../../middleware/tokenValidationMiddleware.js');
var admingroupValidationMiddleware = require('../../middleware/admingroupValidationMiddleware.js');
router.use(tokenValidationMiddleware.validate);

router.get('/', acMailController.filterACmails);
router.use(admingroupValidationMiddleware.validate);

router.post('/', acMailController.addNewACmail);
router.put('/:id', acMailController.updateACmail);
router.delete('/:id', acMailController.deleteACmail);
//router.delete('/images/:image_id', accessoryController.deleteAccessoryImage);

module.exports = router;