var express = require('express');
var router = express.Router();
var blogcategoryController = require('./blogcategoryController.js');
var tokenValidationMiddleware = require('../../middleware/tokenValidationMiddleware.js');
var admingroupValidationMiddleware = require('../../middleware/admingroupValidationMiddleware.js');
router.use(tokenValidationMiddleware.validate);

router.get('/', blogcategoryController.filterBlogCategories);
router.use(admingroupValidationMiddleware.validate);

router.post('/', blogcategoryController.addNewBlogCategory);
router.put('/:id', blogcategoryController.updateBlogCategory);
router.delete('/:id', blogcategoryController.deleteBlogCategory);

module.exports = router;