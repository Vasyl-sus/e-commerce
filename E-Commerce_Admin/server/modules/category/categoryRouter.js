var express = require('express');
var router = express.Router();
var categoryController = require('./categoryController.js');
var tokenValidationMiddleware = require('../../middleware/tokenValidationMiddleware.js');
var admingroupValidationMiddleware = require('../../middleware/admingroupValidationMiddleware.js');
router.use(tokenValidationMiddleware.validate);

router.get('/', categoryController.filterCategories);
router.use(admingroupValidationMiddleware.validate);

router.post('/', categoryController.addNewCategory);
router.put('/:id', categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;