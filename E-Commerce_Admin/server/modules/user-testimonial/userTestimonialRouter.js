var express = require('express');
var router = express.Router();
var userTestimonialController = require('./userTestimonialController.js');
var tokenValidationMiddleware = require('../../middleware/tokenValidationMiddleware.js');
var admingroupValidationMiddleware = require('../../middleware/admingroupValidationMiddleware.js');
router.use(tokenValidationMiddleware.validate);
router.use(admingroupValidationMiddleware.validate);

router.get('/', userTestimonialController.filterUserTestimonials);
router.post('/', userTestimonialController.createUserTestimonial);
router.delete('/:id', userTestimonialController.deleteUserTestimonial);
router.put('/:id', userTestimonialController.updateUserTestimonial);

module.exports = router;