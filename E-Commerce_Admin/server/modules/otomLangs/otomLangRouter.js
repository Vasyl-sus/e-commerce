var express = require('express');
var router = express.Router();
var otomLangController = require('./otomLangController.js');
var tokenValidationMiddleware = require('../../middleware/tokenValidationMiddleware.js');
var admingroupValidationMiddleware = require('../../middleware/admingroupValidationMiddleware.js');
router.use(tokenValidationMiddleware.validate);

router.get('/', otomLangController.filterOtomLangs);
router.use(admingroupValidationMiddleware.validate);

router.post('/', otomLangController.addNewOtomLang);
router.put('/:id', otomLangController.updateOtomLang);
router.delete('/:id', otomLangController.deleteOtomLang);

module.exports = router;