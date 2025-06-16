var express = require('express');
var router = express.Router();
var admingroupController = require('./admingroupController.js');
var tokenValidationMiddleware = require('../../middleware/tokenValidationMiddleware.js');
var admingroupValidationMiddleware = require('../../middleware/admingroupValidationMiddleware.js');
router.use(tokenValidationMiddleware.validate);

router.get('/', admingroupController.filterAdmingroups);
router.use(admingroupValidationMiddleware.validate);
router.post('/', admingroupController.addNewAdmingroup);
router.put('/:id', admingroupController.updateAdmingroup);
router.delete('/:id', admingroupController.deleteAdmingroup);
router.get('/permissions/', admingroupController.getAvailablePermissions);

module.exports = router;