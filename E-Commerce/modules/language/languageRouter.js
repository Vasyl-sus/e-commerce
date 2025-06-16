var express = require('express');
var router = express.Router();
var languageController = require('./languageController.js');
var tokenValidationMiddleware = require('../../middleware/tokenValidationMiddleware.js');
// router.use(tokenValidationMiddleware.validate);

router.post('/', languageController.addNewLanguageModules);
router.post('/edit', languageController.editLanguageModules);
router.post('/routes', languageController.editCountryLanguageRoutes);
router.get('/:lang/:name', languageController.getModuleByLanguageAndName);
router.get('/:lang', languageController.getModulesByLanguage);
router.post('/update_product_names', languageController.updateProductNames);


module.exports = router;