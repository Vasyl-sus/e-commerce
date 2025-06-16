var express = require('express');
var router = express.Router();
var influencersController = require('./influencersController.js');
var tokenValidationMiddleware = require('../../middleware/tokenValidationMiddleware.js');
var admingroupValidationMiddleware = require('../../middleware/admingroupValidationMiddleware.js');
router.use(tokenValidationMiddleware.validate);

router.post('/', influencersController.addNewInfluencer);
router.get('/', influencersController.filterInfluencers);
router.get('/:id', influencersController.getInfluencerDetails);
router.put('/:id', influencersController.editInfluencer);
router.delete('/:id', influencersController.deleteInfluencer);

router.post('/payments/:id', influencersController.addInfluencerPayment)
router.put('/payments/:id', influencersController.editInfluencerPayment);
router.delete('/payments/:id', influencersController.deleteInfluencerPayment);

router.post('/order/:id', influencersController.addInfluencerOrder)


module.exports = router;
