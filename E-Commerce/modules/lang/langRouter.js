var express = require('express');
var router = express.Router();
var langController = require('./langController.js');

// router.get('/', langController.getLanguage)
router.get('/pharmacy', langController.getPharmaciesByCity)
router.get('/all', langController.getAllLanguages)
router.get('/config/all', langController.getLangConfig)
router.get('/oto/:orderId', langController.getOtos)
router.put('/buyOto', langController.addOtoToOrder);

router.put('/setlang', langController.setCountry);
router.post('/langconfig', langController.getLangConfigs)
router.post('/langconfigproduct', langController.getProductLangConfigs)
router.post('/testimonials_product', langController.getTestimonialsProduct)
router.post('/blog', langController.getBlogConfigs)
router.post('/blog_post', langController.getBlogPostConfigs)
router.post('/choose_language', langController.getCLConfigs)
router.post('/ambasadors', langController.getTEConfigs)
router.post('/testimonials', langController.getTEConfigs)
router.post('/testimonials/:link', langController.getTELConfigs)
router.post('/accessories', langController.getACConfigs)
router.post('/accessory', langController.getACDConfigs)
router.post('/accessories/:acc_category', langController.getACDConfigs)

router.post('/reviews', langController.postReview)
router.get('/reviews/:link', langController.getReviews)



module.exports = router;