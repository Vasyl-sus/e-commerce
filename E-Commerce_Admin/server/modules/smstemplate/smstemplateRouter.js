var express = require('express');
var router = express.Router();
var smstemplateController = require('./smstemplateController.js');
var tokenValidationMiddleware = require('../../middleware/tokenValidationMiddleware.js');
var admingroupValidationMiddleware = require('../../middleware/admingroupValidationMiddleware.js');
router.use(tokenValidationMiddleware.validate);
router.use(admingroupValidationMiddleware.validate);

router.get('/', smstemplateController.filterSmstemplates);
router.post('/', smstemplateController.addNewSmstemplate);
router.put('/:id', smstemplateController.updateSmstemplate);
router.delete('/:id', smstemplateController.deleteSmstemplate);

module.exports = router;