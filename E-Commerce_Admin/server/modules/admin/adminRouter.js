var express = require('express');
var router = express.Router();
var adminController = require('./adminController.js');
var tokenValidationMiddleware = require('../../middleware/tokenValidationMiddleware.js');
var admingroupValidationMiddleware = require('../../middleware/admingroupValidationMiddleware.js');
router.get('/init', adminController.initData)
router.use(tokenValidationMiddleware.validate);

router.get('/', adminController.filterAdmins);
router.use(admingroupValidationMiddleware.validate);
router.post('/', adminController.addNewAdmin);
router.put('/:id', adminController.updateAdmin);
router.delete('/:id', adminController.deleteAdmin);

module.exports = router;