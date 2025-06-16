var express = require('express');
var router = express.Router();
var testimonialController = require('./testimonialController.js');
var tokenValidationMiddleware = require('../../middleware/tokenValidationMiddleware.js');
var admingroupValidationMiddleware = require('../../middleware/admingroupValidationMiddleware.js');
router.use(tokenValidationMiddleware.validate);
router.use(admingroupValidationMiddleware.validate);

router.get('/', testimonialController.filterTestimonials);
router.post('/', testimonialController.addNewTestimonial);
router.put('/:id', testimonialController.updateTestimonial);
router.delete('/:id', testimonialController.deleteTestimonial);
router.delete('/images/:image_id', testimonialController.deleteTestimonialImage);

module.exports = router;