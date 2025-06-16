var express = require('express');
var router = express.Router();
var productController = require('./productController.js');
var tokenValidationMiddleware = require('../../middleware/tokenValidationMiddleware.js');
var admingroupValidationMiddleware = require('../../middleware/admingroupValidationMiddleware.js');
router.use(tokenValidationMiddleware.validate);



router.get('/', productController.filterProducts);
router.use(admingroupValidationMiddleware.validate);
router.post('/', productController.addNewProduct);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);
router.get('/stock', productController.getAllStockchanges);
router.put('/stock/:id', productController.updateProductStock);
router.get('/stock/:id', productController.getStockchanges);
router.delete('/image/:id', productController.deleteProductImage);

router.get('/reviews', productController.filterProductReviews);
router.put('/reviews/:id', productController.editProductReviews);
router.delete('/reviews/:id', productController.deleteProductReviews);

module.exports = router;