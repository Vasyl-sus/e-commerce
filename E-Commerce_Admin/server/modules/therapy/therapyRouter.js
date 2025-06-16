var express = require('express');
var router = express.Router();
var therapyController = require('./therapyController.js');
var tokenValidationMiddleware = require('../../middleware/tokenValidationMiddleware.js');
var admingroupValidationMiddleware = require('../../middleware/admingroupValidationMiddleware.js');
router.use(tokenValidationMiddleware.validate);

router.get('/', therapyController.filterTherapies);
router.use(admingroupValidationMiddleware.validate);
router.post('/', therapyController.addNewTherapy);
router.put('/:id', therapyController.updateTherapy);
router.delete('/:id', therapyController.deleteTherapy1);
router.delete('/image/:id', therapyController.deleteTherapyImage);

module.exports = router;